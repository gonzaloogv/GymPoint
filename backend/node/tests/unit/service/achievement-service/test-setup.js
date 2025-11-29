/**
 * Test Setup - Mocks centralizados para achievement-service
 */

const mockSequelize = {
  transaction: jest.fn(),
  query: jest.fn(),
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn(),
};

const mockAchievementDefinition = {
  CATEGORIES: {
    STREAK: 'STREAK',
    FREQUENCY: 'FREQUENCY',
    ASSISTANCE: 'ASSISTANCE',
    ROUTINE: 'ROUTINE',
    WORKOUT: 'WORKOUT',
    CHALLENGE: 'CHALLENGE',
    PROGRESS: 'PROGRESS',
    TOKEN: 'TOKEN',
    ONBOARDING: 'ONBOARDING',
  },
  METRIC_TYPES: {
    STREAK_DAYS: 'STREAK_DAYS',
    STREAK_RECOVERY_USED: 'STREAK_RECOVERY_USED',
    ASSISTANCE_TOTAL: 'ASSISTANCE_TOTAL',
    FREQUENCY_WEEKS_MET: 'FREQUENCY_WEEKS_MET',
    ROUTINE_COMPLETED_COUNT: 'ROUTINE_COMPLETED_COUNT',
    WORKOUT_SESSION_COMPLETED: 'WORKOUT_SESSION_COMPLETED',
    DAILY_CHALLENGE_COMPLETED_COUNT: 'DAILY_CHALLENGE_COMPLETED_COUNT',
    PR_RECORD_COUNT: 'PR_RECORD_COUNT',
    BODY_WEIGHT_PROGRESS: 'BODY_WEIGHT_PROGRESS',
    TOKEN_BALANCE_REACHED: 'TOKEN_BALANCE_REACHED',
    TOKEN_SPENT_TOTAL: 'TOKEN_SPENT_TOTAL',
    ONBOARDING_STEP_COMPLETED: 'ONBOARDING_STEP_COMPLETED',
  },
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

const mockUserAchievement = {
  findOrCreate: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
};

const mockUserAchievementEvent = {
  create: jest.fn(),
};

const mockUserProfile = {
  findByPk: jest.fn(),
  count: jest.fn(),
};

const mockStreak = {
  findOne: jest.fn(),
};

const mockAssistance = {
  count: jest.fn(),
};

const mockFrequencyHistory = {
  count: jest.fn(),
};

const mockUserRoutine = {
  count: jest.fn(),
};

const mockWorkoutSession = {
  count: jest.fn(),
};

const mockUserDailyChallenge = {
  count: jest.fn(),
};

const mockTokenLedger = {
  sum: jest.fn(),
};

const mockProgress = {
  findAll: jest.fn(),
};

const mockProgressExercise = {
  count: jest.fn(),
};

const mockAppEvents = {
  emit: jest.fn(),
};

const mockErrors = {
  ValidationError: class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ValidationError';
    }
  },
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
};

const mockAchievementSideEffects = {
  handleUnlock: jest.fn(),
};

const mockRewardService = {
  getActiveMultiplier: jest.fn(),
};

// Mock de Sequelize Op
const mockOp = {
  in: Symbol('in'),
  ne: Symbol('ne'),
  gte: Symbol('gte'),
  lt: Symbol('lt'),
  or: Symbol('or'),
};

// Setup de mocks
jest.mock('../../../../config/database', () => mockSequelize);

jest.mock('../../../../models', () => ({
  AchievementDefinition: mockAchievementDefinition,
  UserAchievement: mockUserAchievement,
  UserAchievementEvent: mockUserAchievementEvent,
  UserProfile: mockUserProfile,
  Streak: mockStreak,
  Assistance: mockAssistance,
  FrequencyHistory: mockFrequencyHistory,
  UserRoutine: mockUserRoutine,
  WorkoutSession: mockWorkoutSession,
  UserDailyChallenge: mockUserDailyChallenge,
  TokenLedger: mockTokenLedger,
  Progress: mockProgress,
  ProgressExercise: mockProgressExercise,
}));

jest.mock('sequelize', () => ({
  Op: mockOp,
}));

jest.mock('../../../../utils/errors', () => mockErrors);

jest.mock('../../../../websocket/events/event-emitter', () => ({
  appEvents: mockAppEvents,
  EVENTS: {
    ACHIEVEMENT_CREATED: 'ACHIEVEMENT_CREATED',
    ACHIEVEMENT_UPDATED: 'ACHIEVEMENT_UPDATED',
  },
}));

jest.mock('../../../../services/achievement-side-effects', () => mockAchievementSideEffects);

jest.mock('../../../../services/reward-service', () => mockRewardService);

module.exports = {
  mockSequelize,
  mockTransaction,
  mockAchievementDefinition,
  mockUserAchievement,
  mockUserAchievementEvent,
  mockUserProfile,
  mockStreak,
  mockAssistance,
  mockFrequencyHistory,
  mockUserRoutine,
  mockWorkoutSession,
  mockUserDailyChallenge,
  mockTokenLedger,
  mockProgress,
  mockProgressExercise,
  mockAppEvents,
  mockErrors,
  mockAchievementSideEffects,
  mockRewardService,
  mockOp,
};
