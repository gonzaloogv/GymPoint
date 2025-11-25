jest.mock('jsonwebtoken');
jest.mock('bcryptjs');
jest.mock('../services/frequency-service');
jest.mock('../config/database', () => ({ transaction: jest.fn() }));
jest.mock('../models/Frequency', () => ({}));

jest.mock('../utils/auth-providers/google-provider', () => {
  return jest.fn().mockImplementation(() => ({
    verifyToken: jest.fn(),
    validateGoogleUser: jest.fn()
  }));
});

jest.mock('../models', () => {
  class UserProfile {
    constructor(data) { Object.assign(this, data); this.save = jest.fn(); }
  }
  UserProfile.create = jest.fn();
  return {
    Account: { findOne: jest.fn(), create: jest.fn() },
    Role: { findOne: jest.fn() },
    AccountRole: { create: jest.fn() },
    UserProfile,
    AdminProfile: class {}
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

process.env.GOOGLE_CLIENT_ID = 'test-client-id-123';
process.env.JWT_SECRET = 'secret';
process.env.JWT_REFRESH_SECRET = 'refresh';

const authService = require('../services/auth-service');
const { Account } = require('../models');

describe('Google OAuth Authentication', () => {
  let mockReq;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      headers: {
        'user-agent': 'Mozilla/5.0'
      },
      ip: '127.0.0.1'
    };
  });

  describe('login - Validación de Proveedor', () => {
    it('rechaza login con contraseña si la cuenta es de Google', async () => {
      Account.findOne.mockResolvedValue({
        id_account: 4,
        email: 'google@example.com',
        auth_provider: 'google',
        roles: [],
        save: jest.fn()
      });

      await expect(authService.login('google@example.com', 'password123', mockReq))
        .rejects.toThrow('Esta cuenta fue creada con Google. Por favor, inicia sesión con Google.');
    });
  });
});
