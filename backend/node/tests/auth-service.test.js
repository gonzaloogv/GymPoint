jest.mock('bcryptjs');
jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn()
}));
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

const authService = require('../services/auth-service');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Streak = require('../models/Streak');
const RefreshToken = require('../models/RefreshToken');
const frequencyService = require('../services/frequency-service');
const jwt = require('jsonwebtoken');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('auth-service.register', () => {
  it('creates a new user with hashed password', async () => {
    const data = {
      email: 'test@example.com',
      password: 'pass',
      name: 'User',
      lastname: 'Test',
      gender: 'M',
      locality: 'City',
      age: 20,
      subscription: 'FREE',
      frequency_goal: 3
    };

    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed');
    const created = { id_user: 1, save: jest.fn() };
    User.create.mockResolvedValue(created);
    frequencyService.crearMetaSemanal.mockResolvedValue({ id_frequency: 2 });
    Streak.create.mockResolvedValue({ id_streak: 5 });

    const user = await authService.register(data);

    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ password: 'hashed' }));
    expect(created.save).toHaveBeenCalled();
    expect(user).toBe(created);
  });

  it('throws if email already exists', async () => {
    User.findOne.mockResolvedValue({ id_user: 1 });

    await expect(authService.register({ email: 'exists', password: 'a' }))
      .rejects.toThrow('El email ya está registrado');
  });
});

describe('auth-service.login', () => {
  const req = { headers: {}, ip: '127.0.0.1', connection: {} };

  it('returns tokens when credentials are valid', async () => {
    const fakeUser = { id_user: 2, password: 'hash', subscription: 'FREE', email: 'a@a.com' };
    User.findOne.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign
      .mockReturnValueOnce('access')
      .mockReturnValueOnce('refresh');
    RefreshToken.create.mockResolvedValue({});

    const result = await authService.login('a@a.com', 'pass', req);

    expect(result).toEqual({ token: 'access', refreshToken: 'refresh', user: fakeUser });
  });

  it('throws on invalid credentials', async () => {
    User.findOne.mockResolvedValue({ id_user: 3, password: 'hash' });
    bcrypt.compare.mockResolvedValue(false);

    await expect(authService.login('a@a.com', 'wrong', req))
      .rejects.toThrow('Credenciales inválidas');
  });
});