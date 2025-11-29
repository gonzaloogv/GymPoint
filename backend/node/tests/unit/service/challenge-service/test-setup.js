/**
 * Test Setup - Mocks centralizados para challenge-service
 */

// Mock Repositories
const mockDailyChallengeRepository = {
  findByDate: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findUserProgress: jest.fn(),
  createUserProgress: jest.fn(),
  updateUserProgress: jest.fn(),
  listUserChallenges: jest.fn(),
  createTemplate: jest.fn(),
  updateTemplate: jest.fn(),
  findTemplateById: jest.fn(),
  listTemplates: jest.fn(),
  getSettings: jest.fn(),
  updateSettings: jest.fn(),
};

jest.mock('../../../../infra/db/repositories', () => ({
  dailyChallengeRepository: mockDailyChallengeRepository,
}));

// Mock Services
const mockTokenLedgerService = {
  registrarMovimiento: jest.fn(),
};

const mockRewardService = {
  getActiveMultiplier: jest.fn(),
};

const mockAchievementService = {
  syncAllAchievementsForUser: jest.fn(),
};

const mockProcessUnlockResults = jest.fn();

jest.mock('../../../../services/token-ledger-service', () => mockTokenLedgerService);
jest.mock('../../../../services/reward-service', () => mockRewardService);
jest.mock('../../../../services/achievement-service', () => mockAchievementService);
jest.mock('../../../../services/achievement-side-effects', () => ({
  processUnlockResults: mockProcessUnlockResults,
}));

// Mock Errors
const mockErrors = {
  NotFoundError: require('../../../../utils/errors').NotFoundError,
  BusinessError: require('../../../../utils/errors').BusinessError,
  ValidationError: require('../../../../utils/errors').ValidationError,
};

// Mock Constants
jest.mock('../../../../config/constants', () => ({
  TOKEN_REASONS: {
    DAILY_CHALLENGE_COMPLETED: 'DAILY_CHALLENGE_COMPLETED',
  },
}));

const challengeService = require('../../../../services/challenge-service');

module.exports = {
  mockDailyChallengeRepository,
  mockTokenLedgerService,
  mockRewardService,
  mockAchievementService,
  mockProcessUnlockResults,
  mockErrors,
  challengeService,
};
