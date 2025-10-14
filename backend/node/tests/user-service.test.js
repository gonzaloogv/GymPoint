jest.mock('../models', () => ({
  Account: { findByPk: jest.fn(), findOne: jest.fn() },
  UserProfile: { findByPk: jest.fn() },
  UserBodyMetric: { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn() },
  AccountDeletionRequest: { findOne: jest.fn(), findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
  RefreshToken: { update: jest.fn() }
}));
jest.mock('../config/database', () => ({ transaction: jest.fn() }));
jest.mock('../services/token-ledger-service', () => ({
  registrarMovimiento: jest.fn()
}));

const userService = require('../services/user-service');
const { Account, UserProfile, UserBodyMetric, AccountDeletionRequest, RefreshToken } = require('../models');
const sequelize = require('../config/database');
const tokenLedgerService = require('../services/token-ledger-service');
const { ACCOUNT_DELETION } = require('../config/constants');

beforeEach(() => {
  jest.clearAllMocks();
  sequelize.transaction.mockImplementation(async (fn) => {
    const transaction = {
      LOCK: { UPDATE: 'UPDATE' },
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue()
    };

    if (typeof fn === 'function') {
      return fn(transaction);
    }

    return transaction;
  });
});

describe('actualizarPerfil', () => {
  it('actualiza campos permitidos y recarga perfil', async () => {
    const profile = {
      id_user_profile: 1,
      subscription: 'FREE',
      tokens: 50,
      name: 'old',
      birth_date: '2000-01-01',
      update: jest.fn(async (data) => Object.assign(profile, data)),
      reload: jest.fn().mockResolvedValue(),
      account: { email: 'a@a.com' }
    };
    UserProfile.findByPk.mockResolvedValue(profile);

    const result = await userService.actualizarPerfil(1, { name: 'n', birth_date: '1995-05-20', password: 'ignore' });

    expect(profile.update).toHaveBeenCalledWith({ name: 'n', birth_date: '1995-05-20' });
    expect(profile.reload).toHaveBeenCalledWith({
      include: { model: expect.any(Object), as: 'account', attributes: ['email'] }
    });
    expect(result).toEqual(expect.objectContaining({ name: 'n', birth_date: '1995-05-20', email: 'a@a.com' }));
  });

  it('lanza error si el perfil no existe', async () => {
    UserProfile.findByPk.mockResolvedValue(null);
    await expect(userService.actualizarPerfil(1, {}))
      .rejects.toThrow('Perfil de usuario no encontrado');
  });
});

describe('obtenerUsuario', () => {
  it('combina datos de account y perfil', async () => {
    Account.findByPk.mockResolvedValue({
      id_account: 2,
      email: 'test@example.com',
      auth_provider: 'local',
      email_verified: true,
      last_login: new Date(),
      userProfile: {
        id_user_profile: 5,
        name: 'User',
        lastname: 'Test',
        gender: 'M',
        birth_date: '1999-04-10',
        locality: 'City',
        subscription: 'FREE',
        tokens: 10,
        id_streak: 3,
        profile_picture_url: 'pic',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const result = await userService.obtenerUsuario(2);

    expect(result).toEqual(expect.objectContaining({
      id: 2,
      email: 'test@example.com',
      id_user_profile: 5,
      name: 'User'
    }));
  });

  it('lanza error si no encuentra usuario', async () => {
    Account.findByPk.mockResolvedValue(null);
    await expect(userService.obtenerUsuario(1)).rejects.toThrow('Usuario no encontrado');
  });
});

describe('eliminarCuentaDefinitiva', () => {
  it('anonimiza perfil, revoca tokens y desactiva cuenta', async () => {
    const userProfile = {
      id_user_profile: 10,
      update: jest.fn().mockResolvedValue()
    };
    const account = {
      id_account: 7,
      update: jest.fn().mockResolvedValue(),
      userProfile
    };
    Account.findByPk.mockResolvedValue(account);

    await userService.eliminarCuentaDefinitiva(7);

    expect(userProfile.update).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Usuario',
      lastname: 'Eliminado',
      tokens: 0
    }), expect.any(Object));
    expect(RefreshToken.update).toHaveBeenCalledWith(
      { revoked: true },
      expect.objectContaining({ where: { id_user: 10 } })
    );
    expect(account.update).toHaveBeenCalledWith(expect.objectContaining({
      is_active: false,
      email_verified: false
    }), expect.any(Object));
    const updatedEmail = account.update.mock.calls[0][0].email;
    expect(updatedEmail).toMatch(/^deleted_7_/);
  });

  it('lanza error si la cuenta no existe', async () => {
    Account.findByPk.mockResolvedValue(null);
    await expect(userService.eliminarCuentaDefinitiva(1)).rejects.toThrow('Cuenta no encontrado');
  });
});

describe('procesarSolicitudEliminacion', () => {
  it('retorna null si no hay instancia', async () => {
    await expect(userService.procesarSolicitudEliminacion(null)).resolves.toBeNull();
  });

  it('no procesa solicitudes no pendientes', async () => {
    const plain = {
      id_request: 4,
      id_account: 10,
      status: 'CANCELLED',
      scheduled_deletion_date: '2025-10-01',
      metadata: {}
    };

    AccountDeletionRequest.findByPk.mockResolvedValue({
      ...plain,
      get: jest.fn().mockReturnValue(plain)
    });

    const result = await userService.procesarSolicitudEliminacion({ id_request: 4 });
    expect(result).toEqual(expect.objectContaining({ status: 'CANCELLED' }));
  });

  it('marca completada una solicitud pendiente', async () => {
    const state = {
      id_request: 6,
      id_account: 12,
      status: 'PENDING',
      scheduled_deletion_date: '2025-10-05',
      requested_at: new Date(),
      cancelled_at: null,
      completed_at: null,
      metadata: {}
    };

    const requestInstance = {
      ...state,
      update: jest.fn(async (payload) => {
        Object.assign(state, payload);
        Object.assign(requestInstance, payload);
      }),
      get: jest.fn(() => ({ ...state }))
    };
    requestInstance.reload = jest.fn().mockResolvedValue(requestInstance);

    AccountDeletionRequest.findByPk.mockResolvedValue(requestInstance);

    const userProfile = {
      id_user_profile: 22,
      update: jest.fn().mockResolvedValue()
    };
    const account = {
      id_account: 12,
      userProfile,
      update: jest.fn().mockResolvedValue()
    };
    Account.findByPk.mockResolvedValue(account);

    const result = await userService.procesarSolicitudEliminacion({ id_request: 6 });

    expect(userProfile.update).toHaveBeenCalled();
    expect(account.update).toHaveBeenCalledWith(expect.objectContaining({ is_active: false }), expect.any(Object));
    expect(requestInstance.update).toHaveBeenCalledWith(expect.objectContaining({
      status: 'COMPLETED'
    }), expect.any(Object));
    expect(result).toEqual(expect.objectContaining({ status: 'COMPLETED' }));
  });
});

describe('registros de métricas corporales', () => {
  beforeEach(() => {
    tokenLedgerService.registrarMovimiento.mockResolvedValue({});
  });

  it('registra métricas válidas y otorga tokens', async () => {
    const metricCreated = { id_body_metric: 11 };
    UserProfile.findByPk.mockResolvedValue({ id_user_profile: 3 });
    UserBodyMetric.create.mockResolvedValue(metricCreated);

    const metric = await userService.registrarMetricasCorporales(3, {
      weight_kg: 80,
      height_cm: 180,
      source: 'manual'
    });

    expect(UserBodyMetric.create).toHaveBeenCalled();
    expect(tokenLedgerService.registrarMovimiento).toHaveBeenCalledWith(expect.objectContaining({
      userId: 3,
      refId: 11
    }));
    expect(metric).toBe(metricCreated);
  });

  it('lanza error si el valor está fuera de rango', async () => {
    UserProfile.findByPk.mockResolvedValue({ id_user_profile: 4 });
    await expect(userService.registrarMetricasCorporales(4, { weight_kg: 500 }))
      .rejects.toThrow('Peso (kg) debe estar entre 20 y 400');
  });

  it('lista métricas', async () => {
    UserProfile.findByPk.mockResolvedValue({ id_user_profile: 5 });
    UserBodyMetric.findAll.mockResolvedValue(['metric']);

    const metrics = await userService.listarMetricasCorporales(5, { limit: 5 });
    expect(UserBodyMetric.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { id_user_profile: 5 },
      limit: 5
    }));
    expect(metrics).toEqual(['metric']);
  });

  it('obtiene última métrica', async () => {
    UserProfile.findByPk.mockResolvedValue({ id_user_profile: 6 });
    UserBodyMetric.findOne.mockResolvedValue('latest');

    const metric = await userService.obtenerUltimaMetricaCorporal(6);
    expect(UserBodyMetric.findOne).toHaveBeenCalled();
    expect(metric).toBe('latest');
  });
});
describe('solicitarEliminacionCuenta', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('crea solicitud y revoca tokens', async () => {
    const baseDate = new Date('2025-10-15T00:00:00Z');
    jest.useFakeTimers().setSystemTime(baseDate);

    const expectedDeletion = new Date(baseDate);
    expectedDeletion.setUTCDate(expectedDeletion.getUTCDate() + ACCOUNT_DELETION.GRACE_PERIOD_DAYS);
    const expectedDeletionStr = expectedDeletion.toISOString().slice(0, 10);

    Account.findByPk.mockResolvedValue({
      id_account: 7,
      userProfile: { id_user_profile: 10 }
    });
    AccountDeletionRequest.findOne.mockResolvedValue(null);

    const plainRequest = {
      id_request: 1,
      id_account: 7,
      reason: 'Prueba',
      status: 'PENDING',
      scheduled_deletion_date: expectedDeletionStr,
      requested_at: new Date(),
      cancelled_at: null,
      completed_at: null,
      metadata: { grace_period_days: ACCOUNT_DELETION.GRACE_PERIOD_DAYS }
    };

    AccountDeletionRequest.create.mockResolvedValue({
      get: jest.fn().mockReturnValue(plainRequest)
    });

    const result = await userService.solicitarEliminacionCuenta(7, { reason: 'Prueba' });

    expect(AccountDeletionRequest.create).toHaveBeenCalledWith(expect.objectContaining({
      id_account: 7,
      reason: 'Prueba',
      status: 'PENDING',
      scheduled_deletion_date: expectedDeletionStr
    }), expect.any(Object));
    expect(RefreshToken.update).toHaveBeenCalledWith(
      { revoked: true },
      expect.objectContaining({ where: { id_user: 10 } })
    );
    expect(result).toEqual(expect.objectContaining({
      id_account: 7,
      status: 'PENDING',
      can_cancel: true
    }));
  });

  it('impide solicitudes duplicadas', async () => {
    Account.findByPk.mockResolvedValue({
      id_account: 7,
      userProfile: { id_user_profile: 10 }
    });
    AccountDeletionRequest.findOne.mockResolvedValue({ id_request: 5 });

    await expect(userService.solicitarEliminacionCuenta(7))
      .rejects.toThrow('Ya existe una solicitud de eliminación pendiente');
    expect(AccountDeletionRequest.create).not.toHaveBeenCalled();
  });

  it('lanza error si la cuenta no existe', async () => {
    Account.findByPk.mockResolvedValue(null);
    await expect(userService.solicitarEliminacionCuenta(9))
      .rejects.toThrow('Cuenta no encontrado');
  });
});

describe('cancelarSolicitudEliminacionCuenta', () => {
  it('cancela solicitud activa', async () => {
    const state = {
      id_request: 2,
      id_account: 7,
      status: 'PENDING',
      scheduled_deletion_date: '2025-11-14',
      requested_at: new Date(),
      cancelled_at: null,
      completed_at: null,
      metadata: {}
    };

    const requestInstance = {
      ...state,
      update: jest.fn(async (payload) => {
        Object.assign(state, payload);
        Object.assign(requestInstance, payload);
      }),
      get: jest.fn(() => ({ ...state }))
    };
    requestInstance.reload = jest.fn().mockResolvedValue(requestInstance);

    AccountDeletionRequest.findOne.mockResolvedValue(requestInstance);

    const result = await userService.cancelarSolicitudEliminacionCuenta(7);

    expect(requestInstance.update).toHaveBeenCalledWith(expect.objectContaining({
      status: 'CANCELLED'
    }), expect.any(Object));
    expect(result).toEqual(expect.objectContaining({
      status: 'CANCELLED',
      can_cancel: false
    }));
  });

  it('lanza error si no hay solicitud', async () => {
    AccountDeletionRequest.findOne.mockResolvedValue(null);
    await expect(userService.cancelarSolicitudEliminacionCuenta(7))
      .rejects.toThrow('Solicitud de eliminación no encontrado');
  });
});

describe('obtenerEstadoEliminacionCuenta', () => {
  it('retorna solicitud mapeada', async () => {
    const plain = {
      id_request: 3,
      id_account: 8,
      status: 'CANCELLED',
      scheduled_deletion_date: '2025-11-10',
      requested_at: new Date(),
      cancelled_at: new Date(),
      completed_at: null,
      metadata: {}
    };

    AccountDeletionRequest.findOne.mockResolvedValue({
      get: jest.fn().mockReturnValue(plain)
    });

    const result = await userService.obtenerEstadoEliminacionCuenta(8);

    expect(AccountDeletionRequest.findOne).toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({
      id_account: 8,
      status: 'CANCELLED',
      can_cancel: false
    }));
  });

  it('retorna null si no existe solicitud', async () => {
    AccountDeletionRequest.findOne.mockResolvedValue(null);

    const result = await userService.obtenerEstadoEliminacionCuenta(8);
    expect(result).toBeNull();
  });
});
