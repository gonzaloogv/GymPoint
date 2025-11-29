/**
 * Test Setup - Mocks centralizados para admin-daily-challenge-service
 */

// Mock Models
const mockDailyChallenge = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
};

const mockDailyChallengeTemplate = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

const mockDailyChallengeSettings = {
  getSingleton: jest.fn(),
};

const mockUserDailyChallenge = {
  count: jest.fn(),
};

const mockUserProfile = {
  findByPk: jest.fn(),
};

// Mock challengeService
const mockChallengeService = {
  assignDailyChallengeToUser: jest.fn(),
  getUserDailyChallenge: jest.fn(),
};

// Mock Op for Sequelize operators
const mockOp = {
  gte: Symbol('gte'),
  lte: Symbol('lte'),
  ne: Symbol('ne'),
  like: Symbol('like'),
};

// Setup de mocks
jest.mock('../../../../models', () => ({
  DailyChallenge: mockDailyChallenge,
  DailyChallengeTemplate: mockDailyChallengeTemplate,
  DailyChallengeSettings: mockDailyChallengeSettings,
  UserDailyChallenge: mockUserDailyChallenge,
  UserProfile: mockUserProfile,
}));

jest.mock('sequelize', () => ({
  Op: mockOp,
}));

jest.mock('../../../../services/challenge-service', () => mockChallengeService);

module.exports = {
  mockDailyChallenge,
  mockDailyChallengeTemplate,
  mockDailyChallengeSettings,
  mockUserDailyChallenge,
  mockUserProfile,
  mockChallengeService,
  mockOp,
};
