/**
 * Tests para user-service refactorizado con Command/Query pattern
 */

// Mock de database y modelos primero
jest.mock('../config/database', () => ({
  transaction: jest.fn(),
  define: jest.fn(),
  query: jest.fn(),
  QueryTypes: {}
}));

jest.mock('../models', () => ({
  Account: {},
  UserProfile: {},
  UserNotificationSetting: {},
  Presence: {},
  AccountDeletionRequest: {},
  RefreshToken: {}
}));

// Mock de repositories
jest.mock('../infra/db/repositories', () => ({
  userProfileRepository: {
    findById: jest.fn(),
    findByAccountId: jest.fn(),
    updateUserProfile: jest.fn(),
    updateTokens: jest.fn(),
    updateSubscription: jest.fn(),
    findAll: jest.fn()
  },
  accountRepository: {
    findById: jest.fn(),
    updateEmail: jest.fn()
  },
  accountDeletionRequestRepository: {
    findByAccountId: jest.fn(),
    create: jest.fn(),
    cancel: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn()
  },
  userNotificationSettingRepository: {
    findByUserProfileId: jest.fn(),
    updateSettings: jest.fn(),
    createDefaultSettings: jest.fn()
  },
  presenceRepository: {
    findActivePresence: jest.fn(),
    createPresence: jest.fn(),
    updatePresence: jest.fn(),
    listUserPresences: jest.fn()
  },
  refreshTokenRepository: {
    revokeByUserId: jest.fn()
  }
}));

const userService = require('../services/user-service');
const {
  userProfileRepository,
  accountRepository,
  accountDeletionRequestRepository,
  userNotificationSettingRepository,
  presenceRepository,
  refreshTokenRepository
} = require('../infra/db/repositories');
const sequelize = require('../config/database');
const {
  UpdateUserProfileCommand,
  UpdateEmailCommand,
  UpdateUserTokensCommand,
  UpdateUserSubscriptionCommand,
  RequestAccountDeletionCommand,
  CancelAccountDeletionCommand,
  UpdateNotificationSettingsCommand,
  CreatePresenceCommand,
  UpdatePresenceCommand
} = require('../services/commands');
const {
  GetUserByAccountIdQuery,
  GetUserProfileByIdQuery,
  GetAccountDeletionStatusQuery,
  GetNotificationSettingsQuery,
  GetActivePresenceQuery,
  ListUserPresencesQuery
} = require('../services/queries');

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

describe('updateUserProfile', () => {
  it('actualiza el perfil con un Command', async () => {
    const mockProfile = {
      id_user_profile: 1,
      name: 'Juan',
      lastname: 'Pérez',
      email: 'juan@example.com',
      subscription: 'FREE',
      tokens: 100
    };

    userProfileRepository.findById.mockResolvedValue(mockProfile);
    userProfileRepository.updateUserProfile.mockResolvedValue({
      ...mockProfile,
      name: 'Juan Carlos'
    });

    const command = new UpdateUserProfileCommand({
      userProfileId: 1,
      name: 'Juan Carlos',
      lastname: 'Pérez'
    });

    const result = await userService.updateUserProfile(command);

    expect(userProfileRepository.findById).toHaveBeenCalledWith(1, undefined);
    expect(userProfileRepository.updateUserProfile).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ name: 'Juan Carlos', lastname: 'Pérez' }),
      expect.any(Object)
    );
    expect(result.name).toBe('Juan Carlos');
  });

  it('acepta un objeto plano (no Command) usando ensure', async () => {
    const mockProfile = {
      id_user_profile: 2,
      name: 'Ana',
      email: 'ana@example.com'
    };

    userProfileRepository.findById.mockResolvedValue(mockProfile);
    userProfileRepository.updateUserProfile.mockResolvedValue({
      ...mockProfile,
      locality: 'Buenos Aires'
    });

    const result = await userService.updateUserProfile({
      userProfileId: 2,
      locality: 'Buenos Aires'
    });

    expect(result.locality).toBe('Buenos Aires');
  });

  it('lanza error si el perfil no existe', async () => {
    userProfileRepository.findById.mockResolvedValue(null);

    const command = new UpdateUserProfileCommand({
      userProfileId: 999,
      name: 'Test'
    });

    await expect(userService.updateUserProfile(command))
      .rejects.toThrow('Perfil de usuario');
  });

  it('valida birth_date y lanza error si es inválida', async () => {
    userProfileRepository.findById.mockResolvedValue({ id_user_profile: 1 });

    const command = new UpdateUserProfileCommand({
      userProfileId: 1,
      birthDate: 'fecha-invalida'
    });

    await expect(userService.updateUserProfile(command))
      .rejects.toThrow('birth_date inválida');
  });

  it('valida edad fuera de rango (13-100)', async () => {
    userProfileRepository.findById.mockResolvedValue({ id_user_profile: 1 });

    const command = new UpdateUserProfileCommand({
      userProfileId: 1,
      birthDate: '2020-01-01' // Menor de 13 años
    });

    await expect(userService.updateUserProfile(command))
      .rejects.toThrow('Edad fuera de rango');
  });
});

describe('getUserByAccountId', () => {
  it('retorna el perfil del usuario por ID de cuenta', async () => {
    const mockProfile = {
      id_user_profile: 5,
      id_account: 10,
      name: 'María',
      lastname: 'González',
      email: 'maria@example.com',
      subscription: 'PREMIUM',
      tokens: 500
    };

    userProfileRepository.findByAccountId.mockResolvedValue(mockProfile);

    const query = new GetUserByAccountIdQuery({ accountId: 10 });
    const result = await userService.getUserByAccountId(query);

    expect(userProfileRepository.findByAccountId).toHaveBeenCalledWith(10, undefined);
    expect(result).toEqual(mockProfile);
  });

  it('lanza error si no encuentra el usuario', async () => {
    userProfileRepository.findByAccountId.mockResolvedValue(null);

    const query = new GetUserByAccountIdQuery({ accountId: 999 });

    await expect(userService.getUserByAccountId(query))
      .rejects.toThrow('Usuario no encontrado');
  });
});

describe('getUserProfileById', () => {
  it('retorna el perfil por ID de perfil', async () => {
    const mockProfile = {
      id_user_profile: 3,
      name: 'Carlos',
      email: 'carlos@example.com'
    };

    userProfileRepository.findById.mockResolvedValue(mockProfile);

    const query = new GetUserProfileByIdQuery({ userProfileId: 3 });
    const result = await userService.getUserProfileById(query);

    expect(result).toEqual(mockProfile);
  });
});

describe('updateEmail', () => {
  it('actualiza el email de la cuenta', async () => {
    const mockAccount = {
      id_account: 5,
      email: 'viejo@example.com',
      email_verified: true
    };

    accountRepository.findById.mockResolvedValue(mockAccount);
    accountRepository.updateEmail.mockResolvedValue({
      ...mockAccount,
      email: 'nuevo@example.com',
      email_verified: false
    });

    const command = new UpdateEmailCommand({
      accountId: 5,
      email: 'nuevo@example.com'
    });

    const result = await userService.updateEmail(command);

    expect(accountRepository.updateEmail).toHaveBeenCalledWith(
      5,
      'nuevo@example.com',
      undefined
    );
    expect(result.email).toBe('nuevo@example.com');
    expect(result.email_verified).toBe(false);
  });

  it('lanza error si la cuenta no existe', async () => {
    accountRepository.findById.mockResolvedValue(null);

    const command = new UpdateEmailCommand({
      accountId: 999,
      email: 'nuevo@example.com'
    });

    await expect(userService.updateEmail(command))
      .rejects.toThrow('Cuenta no encontrado');
  });
});

describe('updateUserTokens', () => {
  it('actualiza el balance de tokens', async () => {
    userProfileRepository.findById.mockResolvedValue({
      id_user_profile: 1,
      tokens: 100
    });
    userProfileRepository.updateTokens.mockResolvedValue(150);

    const command = new UpdateUserTokensCommand({
      userProfileId: 1,
      delta: 50,
      reason: 'Test reward'
    });

    const newBalance = await userService.updateUserTokens(command);

    expect(userProfileRepository.updateTokens).toHaveBeenCalledWith(1, 50, undefined);
    expect(newBalance).toBe(150);
  });

  it('lanza error si el perfil no existe', async () => {
    userProfileRepository.findById.mockResolvedValue(null);

    const command = new UpdateUserTokensCommand({
      userProfileId: 999,
      delta: 10,
      reason: 'Test'
    });

    await expect(userService.updateUserTokens(command))
      .rejects.toThrow('Perfil de usuario');
  });
});

describe('updateUserSubscription', () => {
  it('actualiza la suscripción del usuario', async () => {
    const mockProfile = {
      id_user_profile: 2,
      subscription: 'FREE'
    };

    userProfileRepository.findById.mockResolvedValue(mockProfile);
    userProfileRepository.updateSubscription.mockResolvedValue({
      ...mockProfile,
      subscription: 'PREMIUM',
      premium_since: new Date()
    });

    const command = new UpdateUserSubscriptionCommand({
      userProfileId: 2,
      subscription: 'PREMIUM'
    });

    const result = await userService.updateUserSubscription(command);

    expect(userProfileRepository.updateSubscription).toHaveBeenCalledWith(
      2,
      'PREMIUM',
      undefined
    );
    expect(result.subscription).toBe('PREMIUM');
  });

  it('valida valores de subscription permitidos', async () => {
    userProfileRepository.findById.mockResolvedValue({ id_user_profile: 2 });

    const command = new UpdateUserSubscriptionCommand({
      userProfileId: 2,
      subscription: 'INVALID'
    });

    await expect(userService.updateUserSubscription(command))
      .rejects.toThrow('Subscription inválida');
  });
});

describe('requestAccountDeletion', () => {
  it('crea una solicitud de eliminación', async () => {
    const mockAccount = {
      id_account: 10,
      userProfile: { id_user_profile: 20 }
    };

    accountRepository.findById.mockResolvedValue(mockAccount);
    accountDeletionRequestRepository.findByAccountId.mockResolvedValue(null);
    accountDeletionRequestRepository.create.mockResolvedValue({
      id_account_deletion_request: 1,
      id_account: 10,
      status: 'PENDING',
      scheduled_deletion_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      reason: 'User request',
      metadata: { grace_period_days: 30 }
    });

    const command = new RequestAccountDeletionCommand({
      accountId: 10,
      reason: 'User request'
    });

    const result = await userService.requestAccountDeletion(command);

    expect(accountDeletionRequestRepository.findByAccountId).toHaveBeenCalledWith(10);
    expect(accountDeletionRequestRepository.create).toHaveBeenCalled();
    expect(refreshTokenRepository.revokeByUserId).toHaveBeenCalledWith(20, expect.any(Object));
    expect(result.status).toBe('PENDING');
  });

  it('lanza error si ya existe una solicitud pendiente', async () => {
    const mockAccount = {
      id_account: 10,
      userProfile: { id_user_profile: 20 }
    };

    accountRepository.findById.mockResolvedValue(mockAccount);
    accountDeletionRequestRepository.findByAccountId.mockResolvedValue({
      status: 'PENDING'
    });

    const command = new RequestAccountDeletionCommand({
      accountId: 10,
      reason: 'Test'
    });

    await expect(userService.requestAccountDeletion(command))
      .rejects.toThrow('Ya existe una solicitud de eliminación pendiente');
  });
});

describe('cancelAccountDeletion', () => {
  it('cancela una solicitud de eliminación pendiente', async () => {
    accountDeletionRequestRepository.findByAccountId.mockResolvedValue({
      id_account_deletion_request: 5,
      status: 'PENDING'
    });
    accountDeletionRequestRepository.cancel.mockResolvedValue({
      id_account_deletion_request: 5,
      status: 'CANCELLED',
      cancelled_at: new Date()
    });

    const command = new CancelAccountDeletionCommand({ accountId: 10 });
    const result = await userService.cancelAccountDeletion(command);

    expect(accountDeletionRequestRepository.cancel).toHaveBeenCalled();
    expect(result.status).toBe('CANCELLED');
  });

  it('lanza error si no hay solicitud pendiente', async () => {
    accountDeletionRequestRepository.findByAccountId.mockResolvedValue(null);

    const command = new CancelAccountDeletionCommand({ accountId: 10 });

    await expect(userService.cancelAccountDeletion(command))
      .rejects.toThrow('Solicitud de eliminación no encontrado');
  });
});

describe('getAccountDeletionStatus', () => {
  it('retorna el estado de la solicitud de eliminación', async () => {
    const mockRequest = {
      id_account_deletion_request: 3,
      id_account: 15,
      status: 'PENDING',
      scheduled_deletion_date: new Date()
    };

    accountDeletionRequestRepository.findByAccountId.mockResolvedValue(mockRequest);

    const query = new GetAccountDeletionStatusQuery({ accountId: 15 });
    const result = await userService.getAccountDeletionStatus(query);

    expect(result).toEqual(mockRequest);
  });

  it('retorna null si no hay solicitud', async () => {
    accountDeletionRequestRepository.findByAccountId.mockResolvedValue(null);

    const query = new GetAccountDeletionStatusQuery({ accountId: 15 });
    const result = await userService.getAccountDeletionStatus(query);

    expect(result).toBeNull();
  });
});

describe('getNotificationSettings', () => {
  it('retorna la configuración de notificaciones del usuario', async () => {
    const mockSettings = {
      id_user_notification_setting: 1,
      id_user_profile: 5,
      push_enabled: true,
      email_enabled: true,
      reminder_enabled: true
    };

    userNotificationSettingRepository.findByUserProfileId.mockResolvedValue(mockSettings);

    const query = new GetNotificationSettingsQuery({ userProfileId: 5 });
    const result = await userService.getNotificationSettings(query);

    expect(result).toEqual(mockSettings);
  });

  it('crea configuración por defecto si no existe', async () => {
    const defaultSettings = {
      id_user_notification_setting: 2,
      id_user_profile: 10,
      push_enabled: true,
      email_enabled: true
    };

    userNotificationSettingRepository.findByUserProfileId.mockResolvedValue(defaultSettings);

    const query = new GetNotificationSettingsQuery({ userProfileId: 10 });
    const result = await userService.getNotificationSettings(query);

    expect(result).toEqual(defaultSettings);
  });
});

describe('updateNotificationSettings', () => {
  it('actualiza la configuración de notificaciones', async () => {
    const updatedSettings = {
      id_user_notification_setting: 1,
      id_user_profile: 5,
      push_enabled: false,
      email_enabled: true
    };

    userNotificationSettingRepository.updateSettings.mockResolvedValue(updatedSettings);

    const command = new UpdateNotificationSettingsCommand({
      userProfileId: 5,
      pushEnabled: false,
      emailEnabled: true
    });

    const result = await userService.updateNotificationSettings(command);

    expect(userNotificationSettingRepository.updateSettings).toHaveBeenCalledWith(
      5,
      expect.objectContaining({
        push_enabled: false,
        email_enabled: true
      }),
      undefined
    );
    expect(result.push_enabled).toBe(false);
  });
});

describe('Legacy aliases', () => {
  it('actualizarPerfil es un alias de updateUserProfile', async () => {
    const mockProfile = { id_user_profile: 1, name: 'Test' };
    userProfileRepository.findById.mockResolvedValue(mockProfile);
    userProfileRepository.updateUserProfile.mockResolvedValue(mockProfile);

    const result = await userService.actualizarPerfil(1, { name: 'Updated' });

    expect(userProfileRepository.updateUserProfile).toHaveBeenCalled();
    expect(result).toEqual(mockProfile);
  });

  it('obtenerUsuario es un alias de getUserByAccountId', async () => {
    const mockProfile = { id_account: 5, name: 'User' };
    userProfileRepository.findByAccountId.mockResolvedValue(mockProfile);

    const result = await userService.obtenerUsuario(5);

    expect(userProfileRepository.findByAccountId).toHaveBeenCalledWith(5, undefined);
    expect(result).toEqual(mockProfile);
  });
});
