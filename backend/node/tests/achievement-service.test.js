jest.mock('../config/database', () => ({
  transaction: jest.fn()
}));

const userAchievementMock = {
  id_user_achievement: 101,
  progress_value: 3,
  progress_denominator: 7,
  unlocked: false,
  unlocked_at: null,
  last_source_type: null,
  last_source_id: null,
  metadata: null,
  save: jest.fn()
};

const definitionsMock = [];

jest.mock('../models', () => ({
  AchievementDefinition: {
    findAll: jest.fn(() => definitionsMock)
  },
  UserAchievement: {
    findOrCreate: jest.fn(),
    findAll: jest.fn()
  },
  UserAchievementEvent: {
    create: jest.fn()
  },
  UserProfile: {
    findByPk: jest.fn()
  },
  Streak: {
    findOne: jest.fn()
  },
  Assistance: {
    count: jest.fn()
  },
  FrequencyHistory: {
    count: jest.fn()
  },
  UserRoutine: {
    count: jest.fn()
  },
  WorkoutSession: {
    count: jest.fn()
  },
  UserDailyChallenge: {
    count: jest.fn()
  },
  TokenLedger: {
    sum: jest.fn()
  },
  Progress: {
    findAll: jest.fn()
  },
  ProgressExercise: {
    count: jest.fn()
  }
}));

const sequelize = require('../config/database');
const {
  AchievementDefinition,
  UserAchievement,
  UserAchievementEvent,
  Streak
} = require('../models');
const achievementService = require('../services/achievement-service');

describe('achievement-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userAchievementMock.progress_value = 3;
    userAchievementMock.progress_denominator = 7;
    userAchievementMock.unlocked = false;
    userAchievementMock.unlocked_at = null;
    userAchievementMock.last_source_type = null;
    userAchievementMock.last_source_id = null;
    userAchievementMock.metadata = null;
    Object.keys(userAchievementMock).forEach((key) => {
      if (typeof userAchievementMock[key] === 'function') {
        userAchievementMock[key].mockClear();
      }
    });

    sequelize.transaction.mockResolvedValue({ commit: jest.fn(), rollback: jest.fn() });
    definitionsMock.length = 0;
  });

  test('syncAchievementForUser unlocks streak achievements when reaching target', async () => {
    const definition = {
      id_achievement_definition: 1,
      target_value: 7,
      metric_type: 'STREAK_DAYS'
    };

    UserAchievement.findOrCreate.mockResolvedValue([userAchievementMock]);
    Streak.findOne.mockResolvedValue({ id_streak: 11, value: 9 });
    UserAchievementEvent.create.mockResolvedValue({});

    const result = await achievementService.syncAchievementForUser({
      idUserProfile: 42,
      definition
    });

    expect(result.unlocked).toBe(true);
    expect(result.justUnlocked).toBe(true);
    expect(userAchievementMock.progress_value).toBe(9);
    expect(userAchievementMock.unlocked).toBe(true);
    expect(userAchievementMock.save).toHaveBeenCalled();

    const events = UserAchievementEvent.create.mock.calls.map((c) => c[0].event_type);
    expect(events).toContain('PROGRESS');
    expect(events).toContain('UNLOCKED');
  });

  test('getUserAchievements returns definitions with progress info', async () => {
    definitionsMock.push({
      id_achievement_definition: 5,
      code: 'STREAK_7',
      target_value: 7,
      category: 'STREAK',
      get: jest.fn(() => ({
        id_achievement_definition: 5,
        code: 'STREAK_7',
        target_value: 7,
        category: 'STREAK'
      }))
    });

    UserAchievement.findAll.mockResolvedValue([
      {
        id_achievement_definition: 5,
        progress_value: 4,
        progress_denominator: 7,
        unlocked: false,
        unlocked_at: null,
        last_source_type: null,
        last_source_id: null
      }
    ]);

    const response = await achievementService.getUserAchievements(42);

    expect(response).toHaveLength(1);
    expect(response[0].progress.value).toBe(4);
    expect(response[0].progress.denominator).toBe(7);
    expect(response[0].unlocked).toBe(false);
  });
});



