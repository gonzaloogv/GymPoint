/**
 * Tests unitarios para operaciones CRUD de AchievementDefinition
 * Complementa el test existente de achievement-service.test.js
 */

jest.mock('../../../models', () => ({
  AchievementDefinition: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    CATEGORIES: {
      ONBOARDING: 'ONBOARDING',
      STREAK: 'STREAK',
      FREQUENCY: 'FREQUENCY',
      ATTENDANCE: 'ATTENDANCE',
      ROUTINE: 'ROUTINE',
      CHALLENGE: 'CHALLENGE',
      PROGRESS: 'PROGRESS',
      TOKEN: 'TOKEN',
      SOCIAL: 'SOCIAL',
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
  },
  UserAchievement: {
    update: jest.fn(),
  },
  UserAchievementEvent: jest.fn(),
  UserProfile: jest.fn(),
  Streak: jest.fn(),
  Assistance: jest.fn(),
  FrequencyHistory: jest.fn(),
  UserRoutine: jest.fn(),
  WorkoutSession: jest.fn(),
  UserDailyChallenge: jest.fn(),
  TokenLedger: jest.fn(),
  Progress: jest.fn(),
  ProgressExercise: jest.fn(),
}));

const { AchievementDefinition, UserAchievement } = require('../../../models');
const achievementService = require('../../../services/achievement-service');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('achievement-service getDefinitions', () => {
  it('retorna todas las definiciones activas por defecto', async () => {
    const mockDefinitions = [
      {
        id_achievement_definition: 1,
        code: 'FIRST_VISIT',
        name: 'Primera visita',
        category: 'ONBOARDING',
        metric_type: 'ASSISTANCE_TOTAL',
        target_value: 1,
        is_active: true,
      },
      {
        id_achievement_definition: 2,
        code: 'STREAK_7',
        name: 'Racha de 7 días',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
        is_active: true,
      },
    ];

    AchievementDefinition.findAll.mockResolvedValue(mockDefinitions);

    const result = await achievementService.getDefinitions({});

    expect(AchievementDefinition.findAll).toHaveBeenCalledWith({
      where: { is_active: true },
      order: [['category', 'ASC'], ['target_value', 'ASC']],
    });
    expect(result).toEqual(mockDefinitions);
  });

  it('retorna definiciones filtradas por categoría', async () => {
    const mockDefinitions = [
      {
        id_achievement_definition: 1,
        code: 'FIRST_VISIT',
        category: 'ONBOARDING',
        is_active: true,
      },
    ];

    AchievementDefinition.findAll.mockResolvedValue(mockDefinitions);

    const result = await achievementService.getDefinitions({ category: 'ONBOARDING' });

    expect(AchievementDefinition.findAll).toHaveBeenCalledWith({
      where: { is_active: true, category: 'ONBOARDING' },
      order: [['category', 'ASC'], ['target_value', 'ASC']],
    });
    expect(result).toEqual(mockDefinitions);
  });

  it('incluye definiciones inactivas cuando se solicita', async () => {
    AchievementDefinition.findAll.mockResolvedValue([]);

    await achievementService.getDefinitions({ includeInactive: true });

    expect(AchievementDefinition.findAll).toHaveBeenCalledWith({
      where: {},
      order: [['category', 'ASC'], ['target_value', 'ASC']],
    });
  });
});

describe('achievement-service createDefinition', () => {
  it('crea una nueva definición correctamente', async () => {
    const payload = {
      code: 'NEW_ACHIEVEMENT',
      name: 'Nuevo Logro',
      description: 'Descripción del logro',
      category: 'ONBOARDING',
      metric_type: 'ASSISTANCE_TOTAL',
      target_value: 10,
      icon_url: 'https://example.com/icon.png',
      metadata: { reward_tokens: 50 },
    };

    const mockDefinition = {
      id_achievement_definition: 1,
      ...payload,
      is_active: true,
    };

    AchievementDefinition.findOne.mockResolvedValue(null);
    AchievementDefinition.create.mockResolvedValue(mockDefinition);

    const result = await achievementService.createDefinition(payload);

    expect(AchievementDefinition.findOne).toHaveBeenCalledWith({
      where: { code: 'NEW_ACHIEVEMENT' },
    });
    expect(AchievementDefinition.create).toHaveBeenCalled();
    expect(result).toEqual(mockDefinition);
  });

  it('lanza ConflictError cuando el código ya existe', async () => {
    const payload = {
      code: 'EXISTING_CODE',
      name: 'Test',
      category: 'ONBOARDING',
      metric_type: 'ASSISTANCE_TOTAL',
      target_value: 1,
    };

    AchievementDefinition.findOne.mockResolvedValue({ id_achievement_definition: 999 });

    await expect(achievementService.createDefinition(payload)).rejects.toThrow(
      'Ya existe un logro con el código EXISTING_CODE'
    );

    expect(AchievementDefinition.create).not.toHaveBeenCalled();
  });
});

describe('achievement-service updateDefinition', () => {
  it('actualiza una definición existente', async () => {
    const mockDefinition = {
      id_achievement_definition: 1,
      code: 'TEST_CODE',
      name: 'Old Name',
      category: 'ONBOARDING',
      metric_type: 'ASSISTANCE_TOTAL',
      target_value: 10,
      is_active: true,
      save: jest.fn().mockResolvedValue(true),
    };

    const payload = {
      name: 'New Name',
      description: 'Updated description',
    };

    AchievementDefinition.findByPk.mockResolvedValue(mockDefinition);

    const result = await achievementService.updateDefinition(1, payload);

    expect(AchievementDefinition.findByPk).toHaveBeenCalledWith(1);
    expect(mockDefinition.save).toHaveBeenCalled();
    expect(mockDefinition.name).toBe('New Name');
  });

  it('lanza NotFoundError cuando la definición no existe', async () => {
    AchievementDefinition.findByPk.mockResolvedValue(null);

    await expect(
      achievementService.updateDefinition(999, { name: 'Test' })
    ).rejects.toThrow('Logro');
  });

  it('lanza ConflictError cuando se intenta usar un código duplicado', async () => {
    const mockDefinition = {
      id_achievement_definition: 1,
      code: 'OLD_CODE',
      save: jest.fn(),
    };

    const duplicateDefinition = {
      id_achievement_definition: 2,
      code: 'NEW_CODE',
    };

    AchievementDefinition.findByPk.mockResolvedValue(mockDefinition);
    AchievementDefinition.findOne.mockResolvedValue(duplicateDefinition);

    await expect(
      achievementService.updateDefinition(1, { code: 'NEW_CODE' })
    ).rejects.toThrow('Ya existe un logro con el código NEW_CODE');

    expect(mockDefinition.save).not.toHaveBeenCalled();
  });

  it('actualiza progress_denominator en UserAchievement cuando cambia target_value', async () => {
    const mockDefinition = {
      id_achievement_definition: 1,
      code: 'TEST',
      target_value: 10,
      save: jest.fn().mockResolvedValue(true),
    };

    AchievementDefinition.findByPk.mockResolvedValue(mockDefinition);
    UserAchievement.update.mockResolvedValue([1]);

    await achievementService.updateDefinition(1, { target_value: 20 });

    expect(UserAchievement.update).toHaveBeenCalledWith(
      { progress_denominator: 20 },
      { where: { id_achievement_definition: 1 } }
    );
  });

  it('no actualiza UserAchievement cuando target_value no cambia', async () => {
    const mockDefinition = {
      id_achievement_definition: 1,
      code: 'TEST',
      target_value: 10,
      save: jest.fn().mockResolvedValue(true),
    };

    AchievementDefinition.findByPk.mockResolvedValue(mockDefinition);

    await achievementService.updateDefinition(1, { name: 'New Name' });

    expect(UserAchievement.update).not.toHaveBeenCalled();
  });
});

describe('achievement-service deleteDefinition', () => {
  it('elimina una definición existente', async () => {
    const mockDefinition = {
      id_achievement_definition: 1,
      code: 'TEST_CODE',
      destroy: jest.fn().mockResolvedValue(true),
    };

    AchievementDefinition.findByPk.mockResolvedValue(mockDefinition);

    const result = await achievementService.deleteDefinition(1);

    expect(AchievementDefinition.findByPk).toHaveBeenCalledWith(1);
    expect(mockDefinition.destroy).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it('lanza NotFoundError cuando la definición no existe', async () => {
    AchievementDefinition.findByPk.mockResolvedValue(null);

    await expect(achievementService.deleteDefinition(999)).rejects.toThrow('Logro');
  });
});
