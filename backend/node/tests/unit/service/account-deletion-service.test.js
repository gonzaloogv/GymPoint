/**
 * Tests para las funciones de Account Deletion en user-service
 */

jest.mock('../../../infra/db/repositories', () => ({
  userProfileRepository: {
    findById: jest.fn(),
    updateUserProfile: jest.fn(),
    updateSubscription: jest.fn(),
    findAll: jest.fn(),
  },
  accountRepository: {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    updateAccount: jest.fn(),
  },
  userNotificationSettingRepository: {
    findByUserProfileId: jest.fn(),
    updateSettings: jest.fn(),
  },
  presenceRepository: {
    createPresence: jest.fn(),
    updatePresence: jest.fn(),
    findActivePresence: jest.fn(),
    findAll: jest.fn(),
  },
}));

jest.mock('../../../services/token-ledger-service', () => ({
  registrarMovimiento: jest.fn(),
  contarMovimientosPorReason: jest.fn(),
}));

jest.mock('../../../models', () => ({
  Account: {
    findByPk: jest.fn(),
  },
  AccountDeletionRequest: {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  RefreshToken: {
    update: jest.fn(),
  },
  UserProfile: jest.fn(),
  UserBodyMetric: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../../config/database', () => ({
  transaction: jest.fn(),
}));

const { Account, AccountDeletionRequest, RefreshToken } = require('../../../models');
const sequelize = require('../../../config/database');
const userService = require('../../../services/user-service');

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn(),
  LOCK: {
    UPDATE: 'UPDATE',
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  sequelize.transaction.mockResolvedValue(mockTransaction);
});

describe('user-service getAccountDeletionStatus', () => {
  it('retorna la solicitud de eliminación más reciente', async () => {
    const mockRequest = {
      id_request: 1,
      id_account: 10,
      reason: 'Ya no uso la app',
      status: 'PENDING',
      scheduled_deletion_date: '2025-12-02',
      requested_at: new Date('2025-11-02T10:00:00.000Z'),
      cancelled_at: null,
      completed_at: null,
      metadata: { grace_period_days: 30 },
      get: jest.fn().mockReturnValue({
        id_request: 1,
        id_account: 10,
        reason: 'Ya no uso la app',
        status: 'PENDING',
        scheduled_deletion_date: '2025-12-02',
        requested_at: new Date('2025-11-02T10:00:00.000Z'),
        cancelled_at: null,
        completed_at: null,
        metadata: { grace_period_days: 30 },
      }),
    };

    AccountDeletionRequest.findOne.mockResolvedValue(mockRequest);

    const result = await userService.getAccountDeletionStatus({ accountId: 10 });

    expect(AccountDeletionRequest.findOne).toHaveBeenCalledWith({
      where: { id_account: 10 },
      order: [['requested_at', 'DESC']],
    });
    expect(result).toMatchObject({
      id_request: 1,
      id_account: 10,
      status: 'PENDING',
      can_cancel: true,
    });
  });

  it('retorna null cuando no hay solicitudes', async () => {
    AccountDeletionRequest.findOne.mockResolvedValue(null);

    const result = await userService.getAccountDeletionStatus({ accountId: 999 });

    expect(result).toBeNull();
  });

  it('calcula can_cancel correctamente para PENDING', async () => {
    const mockRequest = {
      id_request: 1,
      id_account: 10,
      status: 'PENDING',
      scheduled_deletion_date: '2025-12-02',
      requested_at: new Date('2025-11-02T10:00:00.000Z'),
      get: jest.fn().mockReturnThis(),
    };

    AccountDeletionRequest.findOne.mockResolvedValue(mockRequest);

    const result = await userService.getAccountDeletionStatus({ accountId: 10 });

    expect(result.can_cancel).toBe(true);
  });

  it('calcula can_cancel correctamente para COMPLETED', async () => {
    const mockRequest = {
      id_request: 1,
      id_account: 10,
      status: 'COMPLETED',
      scheduled_deletion_date: '2025-12-02',
      requested_at: new Date('2025-11-02T10:00:00.000Z'),
      completed_at: new Date('2025-12-02T00:00:00.000Z'),
      get: jest.fn().mockReturnThis(),
    };

    AccountDeletionRequest.findOne.mockResolvedValue(mockRequest);

    const result = await userService.getAccountDeletionStatus({ accountId: 10 });

    expect(result.can_cancel).toBe(false);
  });
});

describe('user-service requestAccountDeletion', () => {
  it('crea una nueva solicitud de eliminación correctamente', async () => {
    const mockAccount = {
      id_account: 10,
      email: 'test@example.com',
      userProfile: {
        id_user_profile: 5,
      },
    };

    const mockRequest = {
      id_request: 1,
      id_account: 10,
      reason: 'Ya no uso la app',
      status: 'PENDING',
      scheduled_deletion_date: expect.any(String),
      requested_at: expect.any(Date),
      metadata: expect.any(Object),
      get: jest.fn().mockReturnThis(),
    };

    Account.findByPk.mockResolvedValue(mockAccount);
    AccountDeletionRequest.findOne.mockResolvedValue(null);
    AccountDeletionRequest.create.mockResolvedValue(mockRequest);
    RefreshToken.update.mockResolvedValue([1]);

    const result = await userService.requestAccountDeletion({
      accountId: 10,
      reason: 'Ya no uso la app',
    });

    expect(Account.findByPk).toHaveBeenCalledWith(10, expect.any(Object));
    expect(AccountDeletionRequest.findOne).toHaveBeenCalledWith({
      where: {
        id_account: 10,
        status: 'PENDING',
      },
      lock: mockTransaction.LOCK.UPDATE,
      transaction: mockTransaction,
    });
    expect(AccountDeletionRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_account: 10,
        reason: 'Ya no uso la app',
        status: 'PENDING',
      }),
      { transaction: mockTransaction }
    );
    expect(RefreshToken.update).toHaveBeenCalledWith(
      { is_revoked: true },
      {
        where: { id_user: 5 },
        transaction: mockTransaction,
      }
    );
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('lanza NotFoundError cuando la cuenta no existe', async () => {
    Account.findByPk.mockResolvedValue(null);

    await expect(
      userService.requestAccountDeletion({ accountId: 999, reason: 'Test' })
    ).rejects.toThrow('Cuenta');

    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('lanza ConflictError cuando ya existe una solicitud pendiente', async () => {
    const mockAccount = {
      id_account: 10,
      userProfile: { id_user_profile: 5 },
    };

    const existingRequest = {
      id_request: 1,
      status: 'PENDING',
    };

    Account.findByPk.mockResolvedValue(mockAccount);
    AccountDeletionRequest.findOne.mockResolvedValue(existingRequest);

    await expect(
      userService.requestAccountDeletion({ accountId: 10, reason: 'Test' })
    ).rejects.toThrow('Ya existe una solicitud de eliminación pendiente');

    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('incluye metadata con grace_period_days', async () => {
    const mockAccount = {
      id_account: 10,
      userProfile: { id_user_profile: 5 },
    };

    Account.findByPk.mockResolvedValue(mockAccount);
    AccountDeletionRequest.findOne.mockResolvedValue(null);
    AccountDeletionRequest.create.mockResolvedValue({
      id_request: 1,
      metadata: { grace_period_days: 30 },
      get: jest.fn().mockReturnThis(),
    });

    await userService.requestAccountDeletion({ accountId: 10 });

    expect(AccountDeletionRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          grace_period_days: expect.any(Number),
        }),
      }),
      expect.any(Object)
    );
  });

  it('revoca refresh tokens del usuario', async () => {
    const mockAccount = {
      id_account: 10,
      userProfile: { id_user_profile: 5 },
    };

    Account.findByPk.mockResolvedValue(mockAccount);
    AccountDeletionRequest.findOne.mockResolvedValue(null);
    AccountDeletionRequest.create.mockResolvedValue({
      id_request: 1,
      get: jest.fn().mockReturnThis(),
    });
    RefreshToken.update.mockResolvedValue([1]);

    await userService.requestAccountDeletion({ accountId: 10 });

    expect(RefreshToken.update).toHaveBeenCalledWith(
      { is_revoked: true },
      {
        where: { id_user: 5 },
        transaction: mockTransaction,
      }
    );
  });

  it('permite reason null o undefined', async () => {
    const mockAccount = {
      id_account: 10,
      userProfile: { id_user_profile: 5 },
    };

    Account.findByPk.mockResolvedValue(mockAccount);
    AccountDeletionRequest.findOne.mockResolvedValue(null);
    AccountDeletionRequest.create.mockResolvedValue({
      id_request: 1,
      get: jest.fn().mockReturnThis(),
    });

    await userService.requestAccountDeletion({ accountId: 10 });

    expect(AccountDeletionRequest.create).toHaveBeenCalled();
  });
});

describe('user-service cancelAccountDeletion', () => {
  it('cancela una solicitud pendiente correctamente', async () => {
    const mockRequest = {
      id_request: 1,
      id_account: 10,
      status: 'PENDING',
      metadata: { grace_period_days: 30 },
      update: jest.fn().mockResolvedValue(true),
      reload: jest.fn().mockResolvedValue(true),
      get: jest.fn().mockReturnValue({
        id_request: 1,
        id_account: 10,
        status: 'CANCELLED',
        cancelled_at: expect.any(Date),
      }),
    };

    AccountDeletionRequest.findOne.mockResolvedValue(mockRequest);

    const result = await userService.cancelAccountDeletion({ accountId: 10 });

    expect(AccountDeletionRequest.findOne).toHaveBeenCalledWith({
      where: {
        id_account: 10,
        status: 'PENDING',
      },
      lock: mockTransaction.LOCK.UPDATE,
      transaction: mockTransaction,
    });
    expect(mockRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'CANCELLED',
        cancelled_at: expect.any(Date),
        metadata: expect.objectContaining({
          cancelled_at: expect.any(String),
        }),
      }),
      { transaction: mockTransaction }
    );
    expect(mockRequest.reload).toHaveBeenCalledWith({ transaction: mockTransaction });
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('lanza NotFoundError cuando no hay solicitud pendiente', async () => {
    AccountDeletionRequest.findOne.mockResolvedValue(null);

    await expect(
      userService.cancelAccountDeletion({ accountId: 999 })
    ).rejects.toThrow('Solicitud de eliminación');

    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('actualiza metadata con fecha de cancelación', async () => {
    const mockRequest = {
      id_request: 1,
      status: 'PENDING',
      metadata: { grace_period_days: 30 },
      update: jest.fn().mockResolvedValue(true),
      reload: jest.fn().mockResolvedValue(true),
      get: jest.fn().mockReturnThis(),
    };

    AccountDeletionRequest.findOne.mockResolvedValue(mockRequest);

    await userService.cancelAccountDeletion({ accountId: 10 });

    expect(mockRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          grace_period_days: 30,
          cancelled_at: expect.any(String),
        }),
      }),
      expect.any(Object)
    );
  });

  it('preserva metadata existente al cancelar', async () => {
    const mockRequest = {
      id_request: 1,
      status: 'PENDING',
      metadata: {
        grace_period_days: 30,
        requested_via: 'SELF_SERVICE',
        custom_field: 'value',
      },
      update: jest.fn().mockResolvedValue(true),
      reload: jest.fn().mockResolvedValue(true),
      get: jest.fn().mockReturnThis(),
    };

    AccountDeletionRequest.findOne.mockResolvedValue(mockRequest);

    await userService.cancelAccountDeletion({ accountId: 10 });

    expect(mockRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          grace_period_days: 30,
          requested_via: 'SELF_SERVICE',
          custom_field: 'value',
          cancelled_at: expect.any(String),
        }),
      }),
      expect.any(Object)
    );
  });

  it('maneja metadata null correctamente', async () => {
    const mockRequest = {
      id_request: 1,
      status: 'PENDING',
      metadata: null,
      update: jest.fn().mockResolvedValue(true),
      reload: jest.fn().mockResolvedValue(true),
      get: jest.fn().mockReturnThis(),
    };

    AccountDeletionRequest.findOne.mockResolvedValue(mockRequest);

    await userService.cancelAccountDeletion({ accountId: 10 });

    expect(mockRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          cancelled_at: expect.any(String),
        }),
      }),
      expect.any(Object)
    );
  });
});
