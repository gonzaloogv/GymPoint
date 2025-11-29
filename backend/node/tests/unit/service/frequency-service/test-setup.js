/**
 * Test Setup - Mocks centralizados para frequency-service
 */

// Mock Repositories
const mockFrequencyRepository = {
  findByUserProfileId: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updateByUserProfileId: jest.fn(),
  incrementAssist: jest.fn(),
  listHistory: jest.fn(),
  createHistory: jest.fn(),
  getStats: jest.fn(),
};

const mockStreakRepository = {
  findByUserProfileId: jest.fn(),
};

jest.mock('../../../../infra/db/repositories', () => ({
  frequencyRepository: mockFrequencyRepository,
  streakRepository: mockStreakRepository,
}));

// Mock Services
const mockStreakService = {
  updateStreak: jest.fn(),
};

const mockTokenLedgerService = {
  registrarMovimiento: jest.fn(),
};

jest.mock('../../../../services/streak-service', () => mockStreakService);
jest.mock('../../../../services/token-ledger-service', () => mockTokenLedgerService);

// Mock Database Transaction
const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn(),
};

const mockSequelize = {
  transaction: jest.fn(() => Promise.resolve(mockTransaction)),
};

jest.mock('../../../../config/database', () => mockSequelize);

// Mock Constants
jest.mock('../../../../config/constants', () => ({
  TOKENS: {
    WEEKLY_BONUS: 50,
  },
  TOKEN_REASONS: {
    WEEKLY_BONUS: 'WEEKLY_BONUS',
  },
}));

// Mock Errors
const mockErrors = {
  NotFoundError: require('../../../../utils/errors').NotFoundError,
  BusinessError: require('../../../../utils/errors').BusinessError,
};

const frequencyService = require('../../../../services/frequency-service');

module.exports = {
  mockFrequencyRepository,
  mockStreakRepository,
  mockStreakService,
  mockTokenLedgerService,
  mockSequelize,
  mockTransaction,
  mockErrors,
  frequencyService,
};
