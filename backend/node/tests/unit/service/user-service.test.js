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

jest.mock('../../../utils/transaction-helper', () => ({
  runWithRetryableTransaction: jest.fn(),
}));

const { runWithRetryableTransaction } = require('../../../utils/transaction-helper');
const repositories = require('../../../infra/db/repositories');
const tokenLedgerService = require('../../../services/token-ledger-service');
const userService = require('../../../services/user-service');

const userProfileRepository = repositories.userProfileRepository;
const accountRepository = repositories.accountRepository;
const userNotificationSettingRepository = repositories.userNotificationSettingRepository;
const presenceRepository = repositories.presenceRepository;

const mockTransaction = { id: 'tx' };

beforeEach(() => {
  jest.clearAllMocks();
  runWithRetryableTransaction.mockImplementation((callback) =>
    callback(mockTransaction)
  );
});

describe('user-service getUserByAccountId', () => {
  it('retorna usuario completo cuando existe', async () => {
    const account = {
      id_account: 1,
      email: 'test@example.com',
      auth_provider: 'LOCAL',
      email_verified: true,
      last_login: '2024-01-01T00:00:00.000Z',
      roles: [{ role_name: 'USER' }],
      userProfile: {
        id_user_profile: 10,
        id_account: 1,
        name: 'Test',
        lastname: 'User',
        subscription: 'FREE',
        tokens: 0,
      },
    };

    accountRepository.findById.mockResolvedValue(account);

    const result = await userService.getUserByAccountId({ accountId: 1 });

    expect(accountRepository.findById).toHaveBeenCalledWith(1, {
      includeUserProfile: true,
      includeRoles: true,
    });
    expect(result).toEqual({
      id_account: 1,
      email: 'test@example.com',
      auth_provider: 'LOCAL',
      email_verified: true,
      last_login: '2024-01-01T00:00:00.000Z',
      roles: [{ role_name: 'USER' }],
      id_user_profile: 10,
      id_account: 1,
      name: 'Test',
      lastname: 'User',
      subscription: 'FREE',
      tokens: 0,
    });
  });

  it('lanza NotFoundError cuando la cuenta no existe', async () => {
    accountRepository.findById.mockResolvedValue(null);

    await expect(userService.getUserByAccountId({ accountId: 999 })).rejects.toThrow(
      'Usuario'
    );
  });

  it('lanza NotFoundError cuando la cuenta no tiene perfil', async () => {
    const accountWithoutProfile = {
      id_account: 1,
      email: 'test@example.com',
      userProfile: null,
    };

    accountRepository.findById.mockResolvedValue(accountWithoutProfile);

    await expect(userService.getUserByAccountId({ accountId: 1 })).rejects.toThrow(
      'Usuario'
    );
  });
});

describe('user-service getUserProfileById', () => {
  it('retorna perfil cuando existe', async () => {
    const profile = {
      id_user_profile: 10,
      id_account: 1,
      name: 'Test',
      lastname: 'User',
      subscription: 'FREE',
    };

    userProfileRepository.findById.mockResolvedValue(profile);

    const result = await userService.getUserProfileById({ userProfileId: 10 });

    expect(userProfileRepository.findById).toHaveBeenCalledWith(10, {
      includeAccount: true,
    });
    expect(result).toEqual(profile);
  });

  it('lanza NotFoundError cuando el perfil no existe', async () => {
    userProfileRepository.findById.mockResolvedValue(null);

    await expect(userService.getUserProfileById({ userProfileId: 999 })).rejects.toThrow(
      'Perfil de usuario'
    );
  });
});

describe('user-service updateUserProfile', () => {
  it('actualiza el perfil con todos los campos', async () => {
    const existingProfile = {
      id_user_profile: 10,
      name: 'Old',
      lastname: 'Name',
    };

    const updatedProfile = {
      id_user_profile: 10,
      name: 'New',
      lastname: 'Name',
      gender: 'M',
      birth_date: '1990-05-15',
      locality: 'Buenos Aires',
    };

    userProfileRepository.findById.mockResolvedValue(existingProfile);
    userProfileRepository.updateUserProfile.mockResolvedValue(updatedProfile);

    const command = {
      userProfileId: 10,
      name: 'New',
      lastname: 'Name',
      gender: 'M',
      birthDate: '1990-05-15',
      locality: 'Buenos Aires',
    };

    const result = await userService.updateUserProfile(command);

    expect(userProfileRepository.findById).toHaveBeenCalledWith(10);
    expect(userProfileRepository.updateUserProfile).toHaveBeenCalledWith(
      10,
      {
        name: 'New',
        lastname: 'Name',
        gender: 'M',
        birth_date: '1990-05-15',
        locality: 'Buenos Aires',
      },
      { includeAccount: true }
    );
    expect(result).toEqual(updatedProfile);
  });

  it('lanza NotFoundError cuando el perfil no existe', async () => {
    userProfileRepository.findById.mockResolvedValue(null);

    await expect(
      userService.updateUserProfile({ userProfileId: 999, name: 'Test' })
    ).rejects.toThrow('Perfil de usuario');
  });

  it('lanza ValidationError cuando birth_date es inválida', async () => {
    const existingProfile = { id_user_profile: 10 };
    userProfileRepository.findById.mockResolvedValue(existingProfile);

    await expect(
      userService.updateUserProfile({ userProfileId: 10, birthDate: 'invalid-date' })
    ).rejects.toThrow('birth_date inválida');
  });

  it('lanza ValidationError cuando la edad es menor a 13 años', async () => {
    const existingProfile = { id_user_profile: 10 };
    userProfileRepository.findById.mockResolvedValue(existingProfile);

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() - 5);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    await expect(
      userService.updateUserProfile({ userProfileId: 10, birthDate: futureDateStr })
    ).rejects.toThrow('Edad fuera de rango');
  });

  it('lanza ValidationError cuando la edad es mayor a 100 años', async () => {
    const existingProfile = { id_user_profile: 10 };
    userProfileRepository.findById.mockResolvedValue(existingProfile);

    const ancientDate = new Date();
    ancientDate.setFullYear(ancientDate.getFullYear() - 150);
    const ancientDateStr = ancientDate.toISOString().split('T')[0];

    await expect(
      userService.updateUserProfile({ userProfileId: 10, birthDate: ancientDateStr })
    ).rejects.toThrow('Edad fuera de rango');
  });
});

describe('user-service updateEmail', () => {
  it('actualiza el email correctamente', async () => {
    const account = { id_account: 1, email: 'old@example.com' };
    const updatedAccount = { id_account: 1, email: 'new@example.com', email_verified: false };

    accountRepository.findById.mockResolvedValue(account);
    accountRepository.findByEmail.mockResolvedValue(null);
    accountRepository.updateAccount.mockResolvedValue(updatedAccount);

    const command = {
      accountId: 1,
      newEmail: 'new@example.com',
    };

    const result = await userService.updateEmail(command);

    expect(accountRepository.findByEmail).toHaveBeenCalledWith('new@example.com');
    expect(accountRepository.updateAccount).toHaveBeenCalledWith(1, {
      email: 'new@example.com',
      email_verified: false,
    });
    expect(result).toEqual(updatedAccount);
  });

  it('lanza NotFoundError cuando la cuenta no existe', async () => {
    accountRepository.findById.mockResolvedValue(null);

    await expect(
      userService.updateEmail({ accountId: 999, newEmail: 'new@example.com' })
    ).rejects.toThrow('Cuenta');
  });

  it('lanza ConflictError cuando el email ya está en uso por otra cuenta', async () => {
    const account = { id_account: 1, email: 'old@example.com' };
    const existingAccount = { id_account: 2, email: 'new@example.com' };

    accountRepository.findById.mockResolvedValue(account);
    accountRepository.findByEmail.mockResolvedValue(existingAccount);

    await expect(
      userService.updateEmail({ accountId: 1, newEmail: 'new@example.com' })
    ).rejects.toThrow('El email ya está en uso');
  });

  it('permite actualizar al mismo email (no lanza error)', async () => {
    const account = { id_account: 1, email: 'same@example.com' };
    const updatedAccount = { id_account: 1, email: 'same@example.com', email_verified: false };

    accountRepository.findById.mockResolvedValue(account);
    accountRepository.findByEmail.mockResolvedValue(account);
    accountRepository.updateAccount.mockResolvedValue(updatedAccount);

    const result = await userService.updateEmail({ accountId: 1, newEmail: 'same@example.com' });

    expect(result).toEqual(updatedAccount);
  });
});

describe('user-service updateUserTokens', () => {
  it('actualiza tokens correctamente con delta positivo', async () => {
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 150 });

    const command = {
      userProfileId: 10,
      delta: 50,
      reason: 'REWARD',
      refType: 'achievement',
      refId: 5,
    };

    const result = await userService.updateUserTokens(command);

    expect(tokenLedgerService.registrarMovimiento).toHaveBeenCalledWith({
      userId: 10,
      delta: 50,
      reason: 'REWARD',
      refType: 'achievement',
      refId: 5,
    });
    expect(result).toBe(150);
  });

  it('actualiza tokens correctamente con delta negativo', async () => {
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 50 });

    const command = {
      userProfileId: 10,
      delta: -50,
      reason: 'PURCHASE',
    };

    const result = await userService.updateUserTokens(command);

    expect(tokenLedgerService.registrarMovimiento).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 10,
        delta: -50,
        reason: 'PURCHASE',
      })
    );
    expect(result).toBe(50);
  });

  it('usa "MANUAL_ADJUSTMENT" como reason por defecto', async () => {
    tokenLedgerService.registrarMovimiento.mockResolvedValue({ newBalance: 100 });

    const command = {
      userProfileId: 10,
      delta: 100,
    };

    await userService.updateUserTokens(command);

    expect(tokenLedgerService.registrarMovimiento).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 10,
        delta: 100,
        reason: 'MANUAL_ADJUSTMENT',
      })
    );
  });
});

describe('user-service updateUserSubscription', () => {
  it('actualiza suscripción a PREMIUM correctamente', async () => {
    const profile = {
      id_user_profile: 10,
      subscription: 'FREE',
    };

    const updatedProfile = {
      id_user_profile: 10,
      subscription: 'PREMIUM',
      premium_since: '2024-01-01T00:00:00.000Z',
      premium_expires: '2025-01-01T00:00:00.000Z',
    };

    userProfileRepository.findById.mockResolvedValue(profile);
    userProfileRepository.updateSubscription.mockResolvedValue(updatedProfile);

    const command = {
      userProfileId: 10,
      subscription: 'PREMIUM',
      premiumSince: '2024-01-01T00:00:00.000Z',
      premiumExpires: '2025-01-01T00:00:00.000Z',
    };

    const result = await userService.updateUserSubscription(command);

    expect(userProfileRepository.updateSubscription).toHaveBeenCalledWith(10, 'PREMIUM', {
      premiumSince: '2024-01-01T00:00:00.000Z',
      premiumExpires: '2025-01-01T00:00:00.000Z',
    });
    expect(result).toEqual(updatedProfile);
  });

  it('actualiza suscripción a FREE correctamente', async () => {
    const profile = {
      id_user_profile: 10,
      subscription: 'PREMIUM',
    };

    const updatedProfile = {
      id_user_profile: 10,
      subscription: 'FREE',
      premium_since: null,
      premium_expires: null,
    };

    userProfileRepository.findById.mockResolvedValue(profile);
    userProfileRepository.updateSubscription.mockResolvedValue(updatedProfile);

    const command = {
      userProfileId: 10,
      subscription: 'FREE',
    };

    const result = await userService.updateUserSubscription(command);

    expect(result).toEqual(updatedProfile);
  });

  it('lanza NotFoundError cuando el perfil no existe', async () => {
    userProfileRepository.findById.mockResolvedValue(null);

    await expect(
      userService.updateUserSubscription({ userProfileId: 999, subscription: 'PREMIUM' })
    ).rejects.toThrow('Perfil de usuario');
  });

  it('lanza ValidationError cuando subscription es inválida', async () => {
    const profile = { id_user_profile: 10 };
    userProfileRepository.findById.mockResolvedValue(profile);

    await expect(
      userService.updateUserSubscription({ userProfileId: 10, subscription: 'INVALID' })
    ).rejects.toThrow('Suscripción inválida');
  });
});

describe('user-service listUsers', () => {
  it('lista usuarios con paginación', async () => {
    const users = {
      rows: [
        { id_user_profile: 1, name: 'User1', subscription: 'FREE' },
        { id_user_profile: 2, name: 'User2', subscription: 'PREMIUM' },
      ],
      count: 2,
    };

    userProfileRepository.findAll.mockResolvedValue(users);

    const query = {
      page: 1,
      limit: 10,
      subscription: 'FREE',
      search: 'test',
      sortBy: 'created_at',
      order: 'DESC',
    };

    const result = await userService.listUsers(query);

    expect(userProfileRepository.findAll).toHaveBeenCalledWith({
      filters: {
        subscription: 'FREE',
        search: 'test',
      },
      pagination: {
        limit: 10,
        offset: 0,
      },
      sort: {
        field: 'created_at',
        direction: 'DESC',
      },
      options: { includeAccount: true },
    });

    expect(result).toEqual({
      items: users.rows,
      total: 2,
      page: 1,
      limit: 10,
    });
  });
});

describe('user-service getNotificationSettings', () => {
  it('obtiene configuración de notificaciones', async () => {
    const settings = {
      id_user_profile: 10,
      reminders_enabled: true,
      achievements_enabled: true,
      push_enabled: true,
    };

    userNotificationSettingRepository.findByUserProfileId.mockResolvedValue(settings);

    const result = await userService.getNotificationSettings({ userProfileId: 10 });

    expect(userNotificationSettingRepository.findByUserProfileId).toHaveBeenCalledWith(10);
    expect(result).toEqual(settings);
  });
});

describe('user-service updateNotificationSettings', () => {
  it('actualiza configuración de notificaciones', async () => {
    const updatedSettings = {
      id_user_profile: 10,
      reminders_enabled: false,
      achievements_enabled: true,
    };

    userNotificationSettingRepository.updateSettings.mockResolvedValue(updatedSettings);

    const command = {
      userProfileId: 10,
      remindersEnabled: false,
      achievementsEnabled: true,
    };

    const result = await userService.updateNotificationSettings(command);

    expect(userNotificationSettingRepository.updateSettings).toHaveBeenCalledWith(10, {
      reminders_enabled: false,
      achievements_enabled: true,
    });
    expect(result).toEqual(updatedSettings);
  });
});

describe('user-service createPresence', () => {
  it('crea una presencia correctamente', async () => {
    const presence = {
      id_presence: 1,
      id_user_profile: 10,
      id_gym: 5,
      status: 'ACTIVE',
    };

    presenceRepository.createPresence.mockResolvedValue(presence);

    const command = {
      userProfileId: 10,
      gymId: 5,
      distanceMeters: 50,
      accuracyMeters: 10,
    };

    const result = await userService.createPresence(command);

    expect(presenceRepository.createPresence).toHaveBeenCalledWith({
      userProfileId: 10,
      gymId: 5,
      distanceMeters: 50,
      accuracyMeters: 10,
    });
    expect(result).toEqual(presence);
  });
});

describe('user-service updatePresence', () => {
  it('actualiza una presencia correctamente', async () => {
    const updatedPresence = {
      id_presence: 1,
      status: 'EXITED',
      exited_at: '2024-01-01T12:00:00.000Z',
    };

    presenceRepository.updatePresence.mockResolvedValue(updatedPresence);

    const command = {
      presenceId: 1,
      status: 'EXITED',
      exitedAt: '2024-01-01T12:00:00.000Z',
    };

    const result = await userService.updatePresence(command);

    expect(presenceRepository.updatePresence).toHaveBeenCalledWith(1, {
      status: 'EXITED',
      exited_at: '2024-01-01T12:00:00.000Z',
    });
    expect(result).toEqual(updatedPresence);
  });
});

describe('user-service getActivePresence', () => {
  it('obtiene presencia activa', async () => {
    const presence = {
      id_presence: 1,
      id_user_profile: 10,
      id_gym: 5,
      status: 'ACTIVE',
    };

    presenceRepository.findActivePresence.mockResolvedValue(presence);

    const result = await userService.getActivePresence({ userProfileId: 10, gymId: 5 });

    expect(presenceRepository.findActivePresence).toHaveBeenCalledWith(10, 5);
    expect(result).toEqual(presence);
  });
});

describe('user-service listUserPresences', () => {
  it('lista presencias de un usuario', async () => {
    const presences = {
      rows: [
        { id_presence: 1, status: 'ACTIVE' },
        { id_presence: 2, status: 'EXITED' },
      ],
      count: 2,
    };

    presenceRepository.findAll.mockResolvedValue(presences);

    const query = {
      userProfileId: 10,
      gymId: 5,
      status: 'ACTIVE',
      page: 1,
      limit: 10,
    };

    const result = await userService.listUserPresences(query);

    expect(presenceRepository.findAll).toHaveBeenCalledWith({
      filters: {
        userProfileId: 10,
        gymId: 5,
        status: 'ACTIVE',
        startDate: undefined,
        endDate: undefined,
      },
      pagination: {
        limit: 10,
        offset: 0,
      },
      options: { includeRelations: true },
    });

    expect(result).toEqual({
      items: presences.rows,
      total: 2,
      page: 1,
      limit: 10,
    });
  });
});
