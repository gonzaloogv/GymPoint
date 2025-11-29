/**
 * Shared setup for auth-service unit tests.
 * Centralizes mocks, env vars, and common hooks so individual test files stay focused.
 */
jest.mock('../../../../infra/db/repositories', () => ({
  accountRepository: {
    findByEmail: jest.fn(),
    findByGoogleId: jest.fn(),
    createAccount: jest.fn(),
    updateAccount: jest.fn(),
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
    revokeAllByAccount: jest.fn(),
  },
  streakRepository: {
    createStreak: jest.fn(),
  },
  emailVerificationRepository: {
    createVerificationToken: jest.fn(),
    findValidToken: jest.fn(),
    markAsUsed: jest.fn(),
    findByAccount: jest.fn(),
    revokeAllByAccount: jest.fn(),
  },
  passwordResetRepository: {
    createResetToken: jest.fn(),
    findValidToken: jest.fn(),
    markAsUsed: jest.fn(),
    revokeAllByAccount: jest.fn(),
  },
}));

jest.mock('../../../../services/frequency-service', () => ({
  crearMetaSemanal: jest.fn(),
}));

jest.mock('../../../../utils/transaction-helper', () => ({
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

jest.mock('../../../../utils/auth-providers/google-provider', () => {
  const mockInstance = {
    verifyToken: jest.fn(),
  };
  return jest.fn(() => mockInstance);
});

jest.mock('dns', () => ({
  promises: {
    resolveMx: jest.fn().mockResolvedValue([{ exchange: 'mail.example.com', priority: 10 }]),
  },
}));

jest.mock('../../../../utils/email/email.service', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetSuccessEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../../websocket/events/event-emitter', () => ({
  appEvents: {
    emit: jest.fn(),
  },
  EVENTS: {
    USER_REGISTERED: 'user:registered',
    USER_LOGIN: 'user:login',
    USER_CREATED: 'user:created',
  },
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const frequencyService = require('../../../../services/frequency-service');
const { runWithRetryableTransaction } = require('../../../../utils/transaction-helper');
const repositories = require('../../../../infra/db/repositories');
const authService = require('../../../../services/auth-service');

process.env.JWT_SECRET = 'jwt-secret';
process.env.JWT_REFRESH_SECRET = 'refresh-secret';

const accountRepository = repositories.accountRepository;
const userProfileRepository = repositories.userProfileRepository;
const refreshTokenRepository = repositories.refreshTokenRepository;
const streakRepository = repositories.streakRepository;
const emailVerificationRepository = repositories.emailVerificationRepository;
const passwordResetRepository = repositories.passwordResetRepository;

const mockTransaction = { id: 'tx' };
const dns = require('dns').promises;

beforeEach(() => {
  jest.clearAllMocks();
  // Usar fake timers para controlar operaciones asíncronas
  jest.useFakeTimers();
  runWithRetryableTransaction.mockImplementation((callback) => callback(mockTransaction));
  // Mock del repositorio de verificación de email para evitar warnings
  emailVerificationRepository.createVerificationToken.mockResolvedValue({
    id_email_verification: 1,
    token: 'verification-token-123',
  });
});

afterEach(() => {
  // Ejecutar todos los timers pendientes y limpiar
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

afterAll(() => {
  // Limpiar todos los timers y mocks para evitar memory leaks
  jest.clearAllTimers();
  jest.restoreAllMocks();
});

module.exports = {
  authService,
  accountRepository,
  userProfileRepository,
  refreshTokenRepository,
  streakRepository,
  emailVerificationRepository,
  passwordResetRepository,
  frequencyService,
  runWithRetryableTransaction,
  bcrypt,
  jwt,
  dns,
  mockTransaction,
};
