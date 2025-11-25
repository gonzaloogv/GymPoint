jest.mock('../infra/db/repositories', () => ({
  accountRepository: {
    findByEmail: jest.fn(),
    createAccount: jest.fn(),
    findRoleByName: jest.fn(),
    linkRole: jest.fn(),
    findById: jest.fn(),
    updateLastLogin: jest.fn(),
  },
  userProfileRepository: {
    createUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    findById: jest.fn(),
  },
  refreshTokenRepository: {
    createRefreshToken: jest.fn(),
    findActiveByToken: jest.fn(),
    revokeByToken: jest.fn(),
  },
  streakRepository: {
    createStreak: jest.fn(),
  },
}));

jest.mock('../services/frequency-service', () => ({
  crearMetaSemanal: jest.fn(),
}));

jest.mock('../utils/transaction-helper', () => ({
  runWithRetryableTransaction: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock('../utils/auth-providers/google-provider', () =>
  jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn(),
  }))
);

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const frequencyService = require('../services/frequency-service');
const { runWithRetryableTransaction } = require('../utils/transaction-helper');
const repositories = require('../infra/db/repositories');
const authService = require('../services/auth-service');

process.env.JWT_SECRET = 'jwt-secret';
process.env.JWT_REFRESH_SECRET = 'refresh-secret';

const accountRepository = repositories.accountRepository;
const userProfileRepository = repositories.userProfileRepository;
const refreshTokenRepository = repositories.refreshTokenRepository;
const streakRepository = repositories.streakRepository;

const mockTransaction = { id: 'tx' };

beforeEach(() => {
  jest.clearAllMocks();
  runWithRetryableTransaction.mockImplementation((callback) =>
    callback(mockTransaction)
  );
});

describe('auth-service register', () => {
  it('crea una cuenta local y retorna tokens + usuario', async () => {
    const account = { id_account: 1, email: 'test@example.com' };
    const profile = {
      id_user_profile: 10,
      name: 'Test',
      lastname: 'User',
      subscription: 'FREE',
    };
    const accountWithRelations = {
      ...account,
      email_verified: false,
      roles: [{ role_name: 'USER' }],
      userProfile: profile,
    };

    accountRepository.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed');
    accountRepository.createAccount.mockResolvedValue(account);
    accountRepository.findRoleByName.mockResolvedValue({ id_role: 2 });
    userProfileRepository.createUserProfile.mockResolvedValue(profile);
    frequencyService.crearMetaSemanal.mockResolvedValue({ id_frequency: 3 });
    streakRepository.createStreak.mockResolvedValue({ id_streak: 4 });
    userProfileRepository.updateUserProfile.mockResolvedValue(profile);
    accountRepository.findById.mockResolvedValue(accountWithRelations);
    jwt.sign.mockImplementation((_payload, secret) =>
      secret === process.env.JWT_SECRET ? 'access-token' : 'refresh-token'
    );
    refreshTokenRepository.createRefreshToken.mockResolvedValue({});

    const data = {
      email: 'test@example.com',
      password: 'secret',
      name: 'Test',
      lastname: 'User',
      frequency_goal: 3,
    };

    const result = await authService.register(data, { headers: {}, ip: '127.0.0.1' });

    expect(accountRepository.createAccount).toHaveBeenCalledWith(
      expect.objectContaining({ email: data.email, password_hash: 'hashed' }),
      { transaction: mockTransaction }
    );
    expect(userProfileRepository.createUserProfile).toHaveBeenCalledWith(
      expect.objectContaining({ id_account: account.id_account }),
      { transaction: mockTransaction }
    );
    expect(refreshTokenRepository.createRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({ id_user: profile.id_user_profile })
    );
    expect(result).toEqual({
      token: 'access-token',
      refreshToken: 'refresh-token',
      account: accountWithRelations,
      profile,
    });
  });

  it('lanza error si el email ya existe', async () => {
    accountRepository.findByEmail.mockResolvedValue({ id_account: 99 });

    await expect(authService.register({ email: 'exists@example.com' })).rejects.toThrow(
      'El email ya esta registrado'
    );
    expect(accountRepository.createAccount).not.toHaveBeenCalled();
  });
});

describe('auth-service login', () => {
  const context = { headers: {}, ip: '127.0.0.1' };

  it('retorna tokens y usuario para credenciales válidas', async () => {
    const account = {
      id_account: 2,
      email: 'user@example.com',
      password_hash: 'hashed',
      email_verified: true,
      roles: [{ role_name: 'USER' }],
      userProfile: { id_user_profile: 5, subscription: 'FREE' },
    };

    accountRepository.findByEmail.mockResolvedValue(account);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockImplementation((_payload, secret) =>
      secret === process.env.JWT_SECRET ? 'access-token' : 'refresh-token'
    );
    refreshTokenRepository.createRefreshToken.mockResolvedValue({});

    const result = await authService.login({ email: account.email, password: 'secret' }, context);

    expect(accountRepository.updateLastLogin).toHaveBeenCalled();
    expect(refreshTokenRepository.createRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({ id_user: account.userProfile.id_user_profile })
    );
    expect(result).toEqual({
      token: 'access-token',
      refreshToken: 'refresh-token',
      account,
      profile: account.userProfile,
    });
  });

  it('lanza error si la contraseña es inválida', async () => {
    const account = {
      id_account: 2,
      email: 'user@example.com',
      password_hash: 'hashed',
      roles: [],
      userProfile: null,
    };
    accountRepository.findByEmail.mockResolvedValue(account);
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      authService.login({ email: account.email, password: 'wrong' }, context)
    ).rejects.toThrow('Credenciales inválidas');
  });
});
