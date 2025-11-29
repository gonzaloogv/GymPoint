/**
 * Test Setup - Mocks centralizados para assistance-service
 */

// Repositories
const mockAssistanceRepository = {
  findAssistanceByUserAndDate: jest.fn(),
  createAssistance: jest.fn(),
  findAssistanceById: jest.fn(),
  updateAssistance: jest.fn(),
  findAssistances: jest.fn(),
};

const mockGymRepository = {
  findById: jest.fn(),
};

const mockUserProfileRepository = {
  findById: jest.fn(),
};

const mockStreakRepository = {
  findById: jest.fn(),
  updateStreak: jest.fn(),
};

const mockPresenceRepository = {
  findActivePresence: jest.fn(),
  updatePresence: jest.fn(),
  createPresence: jest.fn(),
  countActiveByGym: jest.fn(),
  markAsConvertedToAssistance: jest.fn(),
  findAll: jest.fn(),
};

const mockUserGymRepository = {
  findByUserAndGym: jest.fn(),
  markTrialAsUsed: jest.fn(),
};

const mockFrequencyRepository = {
  findByUserProfileId: jest.fn(),
};

// Services
const mockTokenLedgerService = {
  registrarMovimiento: jest.fn(),
  existeMovimiento: jest.fn(),
};

const mockRewardService = {
  getActiveMultiplier: jest.fn(),
};

const mockAchievementService = {
  syncAllAchievementsForUser: jest.fn(),
};

const mockAchievementSideEffects = {
  processUnlockResults: jest.fn(),
};

const mockFrequencyService = {
  actualizarAsistenciaSemanal: jest.fn(),
};

// Utils
const mockErrors = {
  NotFoundError: class NotFoundError extends Error {
    constructor(message) {
      super(message);
      this.name = 'NotFoundError';
    }
  },
  ConflictError: class ConflictError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ConflictError';
    }
  },
  BusinessError: class BusinessError extends Error {
    constructor(message, code, details) {
      super(message);
      this.name = 'BusinessError';
      this.code = code;
      this.details = details;
    }
  },
  ValidationError: class ValidationError extends Error {
    constructor(message, errors) {
      super(message);
      this.name = 'ValidationError';
      this.errors = errors;
    }
  },
};

const mockGeoUtils = {
  calculateDistance: jest.fn(),
};

const mockEventEmitter = {
  emitEvent: jest.fn(),
  EVENTS: {
    STREAK_UPDATED: 'STREAK_UPDATED',
    STREAK_MILESTONE: 'STREAK_MILESTONE',
    PROGRESS_WEEKLY_UPDATED: 'PROGRESS_WEEKLY_UPDATED',
    ATTENDANCE_RECORDED: 'ATTENDANCE_RECORDED',
    PRESENCE_UPDATED: 'PRESENCE_UPDATED',
    ASSISTANCE_REGISTERED: 'ASSISTANCE_REGISTERED',
  },
};

const mockConstants = {
  PROXIMITY_METERS: 100,
  ACCURACY_MAX_METERS: 50,
  TOKENS: {
    ATTENDANCE: 10,
  },
  TOKEN_REASONS: {
    ATTENDANCE: 'ATTENDANCE',
  },
};

// Setup de mocks
jest.mock('../../../../infra/db/repositories', () => ({
  assistanceRepository: mockAssistanceRepository,
  gymRepository: mockGymRepository,
  userProfileRepository: mockUserProfileRepository,
  streakRepository: mockStreakRepository,
  presenceRepository: mockPresenceRepository,
  userGymRepository: mockUserGymRepository,
  frequencyRepository: mockFrequencyRepository,
}));

jest.mock('../../../../services/token-ledger-service', () => mockTokenLedgerService);
jest.mock('../../../../services/reward-service', () => mockRewardService);
jest.mock('../../../../services/achievement-service', () => mockAchievementService);
jest.mock('../../../../services/achievement-side-effects', () => mockAchievementSideEffects);
jest.mock('../../../../services/frequency-service', () => mockFrequencyService);

jest.mock('../../../../utils/errors', () => mockErrors);
jest.mock('../../../../utils/geo', () => mockGeoUtils);
jest.mock('../../../../websocket/events/event-emitter', () => mockEventEmitter);
jest.mock('../../../../config/constants', () => mockConstants);

module.exports = {
  mockAssistanceRepository,
  mockGymRepository,
  mockUserProfileRepository,
  mockStreakRepository,
  mockPresenceRepository,
  mockUserGymRepository,
  mockFrequencyRepository,
  mockTokenLedgerService,
  mockRewardService,
  mockAchievementService,
  mockAchievementSideEffects,
  mockFrequencyService,
  mockErrors,
  mockGeoUtils,
  mockEventEmitter,
  mockConstants,
};
