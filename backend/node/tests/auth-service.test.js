jest.mock('bcryptjs');
jest.mock('../config/database', () => ({ transaction: jest.fn() }));

const createUserProfileMock = () => {
  const save = jest.fn();
  const instance = { save };
  return { instance, save };
};

jest.mock('../models', () => {
  const userProfileMockFn = jest.fn();
  class UserProfile {
    constructor(data) {
      Object.assign(this, data);
      this.save = jest.fn();
    }
  }
  UserProfile.create = jest.fn();
  UserProfile.findOne = jest.fn();

  class AdminProfile {}

  return {
    __esModule: true,
    Account: { findOne: jest.fn(), create: jest.fn() },
    Role: { findOne: jest.fn() },
    AccountRole: { create: jest.fn() },
    UserProfile,
    AdminProfile,
    __mocks: { userProfileMockFn }
  };
});

jest.mock('../models/Streak', () => ({
  create: jest.fn()
}));
jest.mock('../models/RefreshToken', () => ({
  create: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn()
}));
jest.mock('../services/frequency-service', () => ({
  crearMetaSemanal: jest.fn()
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));
jest.mock('../utils/auth-providers/google-provider', () => {
  return jest.fn().mockImplementation(() => ({
    verifyToken: jest.fn(),
    validateGoogleUser: jest.fn()
  }));
});

process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.JWT_SECRET = 'secret';
process.env.JWT_REFRESH_SECRET = 'refresh-secret';

const sequelize = require('../config/database');
const authService = require('../services/auth-service');
const bcrypt = require('bcryptjs');
const { Account, Role, AccountRole, UserProfile } = require('../models');
const Streak = require('../models/Streak');
const RefreshToken = require('../models/RefreshToken');
const frequencyService = require('../services/frequency-service');
const jwt = require('jsonwebtoken');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('auth-service.register', () => {
  it('crea nueva cuenta de usuario local', async () => {
    const transaction = { commit: jest.fn(), rollback: jest.fn() };
    sequelize.transaction.mockResolvedValue(transaction);

    const account = { id_account: 1, email: 'test@example.com' };
    Account.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed');
    Account.create.mockResolvedValue(account);

    Role.findOne.mockResolvedValue({ id_role: 2 });
    AccountRole.create.mockResolvedValue({});

    const userProfileInstance = new UserProfile({
      id_account: 1,
      id_user_profile: 10,
      subscription: 'FREE',
      name: 'User',
      lastname: 'Test'
    });
    UserProfile.create.mockResolvedValue(userProfileInstance);

    frequencyService.crearMetaSemanal.mockResolvedValue({ id_frequency: 20 });
    Streak.create.mockResolvedValue({ id_streak: 30 });

    const data = {
      email: 'test@example.com',
      password: 'pass',
      name: 'User',
      lastname: 'Test',
      frequency_goal: 3
    };

    const result = await authService.register(data);

    expect(Account.findOne).toHaveBeenCalledWith({ where: { email: data.email }, transaction });
    expect(Account.create).toHaveBeenCalledWith(expect.objectContaining({ email: data.email, password_hash: 'hashed' }), { transaction });
    expect(AccountRole.create).toHaveBeenCalledWith({ id_account: 1, id_role: 2 }, { transaction });
    expect(UserProfile.create).toHaveBeenCalledWith(expect.objectContaining({ id_account: 1 }), { transaction });
    expect(frequencyService.crearMetaSemanal).toHaveBeenCalledWith({ id_user: 10, goal: 3 }, { transaction });
    expect(Streak.create).toHaveBeenCalledWith(expect.objectContaining({ id_user: 10 }), { transaction });
    expect(userProfileInstance.save).toHaveBeenCalledWith({ transaction });
    expect(transaction.commit).toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({
      account,
      userProfile: userProfileInstance,
      id_user: 10,
      email: 'test@example.com'
    }));
  });

  it('lanza error si el email ya existe', async () => {
    const transaction = { commit: jest.fn(), rollback: jest.fn() };
    sequelize.transaction.mockResolvedValue(transaction);
    Account.findOne.mockResolvedValue({ id_account: 1 });

    await expect(authService.register({ email: 'exists', password: 'a' }))
      .rejects.toThrow('El email ya esta registrado');
    expect(transaction.rollback).toHaveBeenCalled();
  });

  it('reintenta el registro si ocurre un lock wait timeout', async () => {
    const transaction1 = { commit: jest.fn(), rollback: jest.fn() };
    const transaction2 = { commit: jest.fn(), rollback: jest.fn() };
    sequelize.transaction
      .mockResolvedValueOnce(transaction1)
      .mockResolvedValueOnce(transaction2);

    const account = { id_account: 5, email: 'retry@example.com' };
    const userProfileInstance = new UserProfile({
      id_account: 5,
      id_user_profile: 50,
      subscription: 'FREE',
      name: 'Retry',
      lastname: 'User'
    });

    const lockError = new Error('lock wait');
    lockError.parent = { code: 'ER_LOCK_WAIT_TIMEOUT' };

    Account.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed');
    Account.create
      .mockRejectedValueOnce(lockError)
      .mockResolvedValueOnce(account);
    Role.findOne.mockResolvedValue({ id_role: 7 });
    AccountRole.create.mockResolvedValue({});
    UserProfile.create.mockResolvedValue(userProfileInstance);
    frequencyService.crearMetaSemanal.mockResolvedValue({ id_frequency: 13 });
    Streak.create.mockResolvedValue({ id_streak: 21 });

    const result = await authService.register({
      email: 'retry@example.com',
      password: 'pass',
      name: 'Retry',
      lastname: 'User',
      frequency_goal: 4
    });

    expect(sequelize.transaction).toHaveBeenCalledTimes(2);
    expect(transaction1.rollback).toHaveBeenCalled();
    expect(transaction2.commit).toHaveBeenCalled();
    expect(Account.create).toHaveBeenCalledTimes(2);
    expect(frequencyService.crearMetaSemanal).toHaveBeenCalledWith({ id_user: 50, goal: 4 }, { transaction: transaction2 });
    expect(result.email).toBe('retry@example.com');
  });
});

describe('auth-service.login', () => {
  const req = { headers: {}, ip: '127.0.0.1', connection: {} };

  it('retorna tokens y refresco para usuarios locales', async () => {
    const account = {
      id_account: 2,
      email: 'a@a.com',
      password_hash: 'hash',
      auth_provider: 'local',
      roles: [{ role_name: 'USER' }],
      userProfile: { id_user_profile: 3, subscription: 'FREE' },
      save: jest.fn()
    };
    Account.findOne.mockResolvedValue(account);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token');
    RefreshToken.create.mockResolvedValue({});

    const result = await authService.login('a@a.com', 'pass', req);

    expect(account.save).toHaveBeenCalled();
    expect(result).toEqual({ token: 'access-token', refreshToken: 'refresh-token', account, profile: account.userProfile });
  });

  it('lanza error si las credenciales son inválidas', async () => {
    Account.findOne.mockResolvedValue({
      id_account: 3,
      password_hash: 'hash',
      auth_provider: 'local',
      roles: [],
      save: jest.fn()
    });
    bcrypt.compare.mockResolvedValue(false);

    await expect(authService.login('a@a.com', 'wrong', req))
      .rejects.toThrow('Credenciales inválidas');
  });
});
