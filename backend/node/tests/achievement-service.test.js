/**
 * Achievement Service - Comprehensive Test Suite
 *
 * Tests de nivel QA profesional cubriendo:
 * - Todos los metric calculators (12 tipos)
 * - Sincronización de logros individuales y masivos
 * - Creación, actualización y eliminación de definiciones
 * - Manejo de errores y validaciones
 * - Transacciones y consistencia
 * - Casos edge y límites
 */

jest.mock('../config/database', () => ({
  transaction: jest.fn()
}));

jest.mock('../models', () => ({
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
      SOCIAL: 'SOCIAL'
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
      ONBOARDING_STEP_COMPLETED: 'ONBOARDING_STEP_COMPLETED'
    }
  },
  UserAchievement: {
    findOrCreate: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn()
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
  UserProfile,
  Streak,
  Assistance,
  FrequencyHistory,
  UserRoutine,
  WorkoutSession,
  UserDailyChallenge,
  TokenLedger,
  Progress,
  ProgressExercise
} = require('../models');
const achievementService = require('../services/achievement-service');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');

describe('Achievement Service - QA Complete Test Suite', () => {
  let mockTransaction;
  let mockUserAchievement;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn()
    };

    mockUserAchievement = {
      id_user_achievement: 101,
      id_user_profile: 42,
      id_achievement_definition: 1,
      progress_value: 0,
      progress_denominator: 10,
      unlocked: false,
      unlocked_at: null,
      last_source_type: null,
      last_source_id: null,
      metadata: null,
      save: jest.fn().mockResolvedValue(true)
    };

    sequelize.transaction.mockResolvedValue(mockTransaction);
  });

  // ============================================
  // METRIC CALCULATORS - Testing all 12 types
  // ============================================

  describe('Metric Calculators', () => {
    describe('STREAK_DAYS', () => {
      it('debe calcular días de racha correctamente', async () => {
        const definition = {
          id_achievement_definition: 1,
          metric_type: 'STREAK_DAYS',
          target_value: 7
        };

        Streak.findOne.mockResolvedValue({
          id_streak: 10,
          value: 5
        });

        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(5);
        expect(result.unlocked).toBe(false);
      });

      it('debe manejar usuario sin racha', async () => {
        const definition = {
          id_achievement_definition: 1,
          metric_type: 'STREAK_DAYS',
          target_value: 7
        };

        Streak.findOne.mockResolvedValue(null);
        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(0);
      });

      it('debe desbloquear al alcanzar target_value', async () => {
        const definition = {
          id_achievement_definition: 1,
          metric_type: 'STREAK_DAYS',
          target_value: 7
        };

        Streak.findOne.mockResolvedValue({
          id_streak: 10,
          value: 10
        });

        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.unlocked).toBe(true);
        expect(result.justUnlocked).toBe(true);
        expect(mockUserAchievement.unlocked).toBe(true);
        expect(mockUserAchievement.unlocked_at).toBeInstanceOf(Date);
      });
    });

    describe('STREAK_RECOVERY_USED', () => {
      it('debe contar recovery items usados', async () => {
        const definition = {
          id_achievement_definition: 2,
          metric_type: 'STREAK_RECOVERY_USED',
          target_value: 3
        };

        Streak.findOne.mockResolvedValue({
          id_streak: 10,
          recovery_items_used: 2
        });

        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(2);
      });

      it('debe retornar 0 si no hay recovery usado', async () => {
        const definition = {
          id_achievement_definition: 2,
          metric_type: 'STREAK_RECOVERY_USED',
          target_value: 3
        };

        Streak.findOne.mockResolvedValue({
          id_streak: 10,
          recovery_items_used: 0
        });

        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(0);
      });
    });

    describe('ASSISTANCE_TOTAL', () => {
      it('debe contar total de asistencias', async () => {
        const definition = {
          id_achievement_definition: 3,
          metric_type: 'ASSISTANCE_TOTAL',
          target_value: 50
        };

        Assistance.count.mockResolvedValue(25);
        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(25);
        expect(Assistance.count).toHaveBeenCalledWith({
          where: { id_user: 42 }
        });
      });

      it('debe manejar cero asistencias', async () => {
        const definition = {
          id_achievement_definition: 3,
          metric_type: 'ASSISTANCE_TOTAL',
          target_value: 50
        };

        Assistance.count.mockResolvedValue(0);
        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(0);
      });
    });

    describe('FREQUENCY_WEEKS_MET', () => {
      it('debe contar semanas con meta alcanzada', async () => {
        const definition = {
          id_achievement_definition: 4,
          metric_type: 'FREQUENCY_WEEKS_MET',
          target_value: 12
        };

        FrequencyHistory.count.mockResolvedValue(8);
        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(8);
        expect(FrequencyHistory.count).toHaveBeenCalledWith({
          where: {
            id_user_profile: 42,
            goal_met: true
          }
        });
      });
    });

    describe('ROUTINE_COMPLETED_COUNT', () => {
      it('debe contar rutinas completadas', async () => {
        const definition = {
          id_achievement_definition: 5,
          metric_type: 'ROUTINE_COMPLETED_COUNT',
          target_value: 10
        };

        UserRoutine.count.mockResolvedValue(6);
        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(6);
        expect(UserRoutine.count).toHaveBeenCalledWith({
          where: {
            id_user: 42,
            finish_date: { ne: null }
          }
        });
      });
    });

    describe('WORKOUT_SESSION_COMPLETED', () => {
      it('debe contar sesiones de entrenamiento completadas', async () => {
        const definition = {
          id_achievement_definition: 6,
          metric_type: 'WORKOUT_SESSION_COMPLETED',
          target_value: 20
        };

        WorkoutSession.count.mockResolvedValue(15);
        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(15);
        expect(WorkoutSession.count).toHaveBeenCalledWith({
          where: {
            id_user_profile: 42,
            status: 'COMPLETED'
          }
        });
      });
    });

    describe('DAILY_CHALLENGE_COMPLETED_COUNT', () => {
      it('debe contar desafíos diarios completados', async () => {
        const definition = {
          id_achievement_definition: 7,
          metric_type: 'DAILY_CHALLENGE_COMPLETED_COUNT',
          target_value: 30
        };

        UserDailyChallenge.count.mockResolvedValue(22);
        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(22);
        expect(UserDailyChallenge.count).toHaveBeenCalledWith({
          where: {
            id_user_profile: 42,
            completed: true
          }
        });
      });
    });

    describe('PR_RECORD_COUNT', () => {
      it('debe contar récords personales', async () => {
        const definition = {
          id_achievement_definition: 8,
          metric_type: 'PR_RECORD_COUNT',
          target_value: 50
        };

        Progress.findAll.mockResolvedValue([
          { id_progress: 1 },
          { id_progress: 2 },
          { id_progress: 3 }
        ]);

        ProgressExercise.count.mockResolvedValue(12);
        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(12);
      });

      it('debe manejar usuario sin progreso', async () => {
        const definition = {
          id_achievement_definition: 8,
          metric_type: 'PR_RECORD_COUNT',
          target_value: 50
        };

        Progress.findAll.mockResolvedValue([]);
        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(0);
        expect(ProgressExercise.count).not.toHaveBeenCalled();
      });
    });

    describe('BODY_WEIGHT_PROGRESS', () => {
      it('debe calcular progreso de peso (INCREASE)', async () => {
        const definition = {
          id_achievement_definition: 9,
          metric_type: 'BODY_WEIGHT_PROGRESS',
          target_value: 10,
          metadata: { direction: 'INCREASE' }
        };

        Progress.findAll.mockResolvedValue([
          { body_weight: 70, date: '2024-01-01' },
          { body_weight: 75, date: '2024-02-01' }
        ]);

        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(5);
      });

      it('debe calcular progreso de peso (DECREASE)', async () => {
        const definition = {
          id_achievement_definition: 9,
          metric_type: 'BODY_WEIGHT_PROGRESS',
          target_value: 5,
          metadata: { direction: 'DECREASE' }
        };

        Progress.findAll.mockResolvedValue([
          { body_weight: 85, date: '2024-01-01' },
          { body_weight: 78, date: '2024-02-01' }
        ]);

        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(7);
      });

      it('debe retornar 0 si no hay suficientes entradas', async () => {
        const definition = {
          id_achievement_definition: 9,
          metric_type: 'BODY_WEIGHT_PROGRESS',
          target_value: 10,
          metadata: { direction: 'INCREASE' }
        };

        Progress.findAll.mockResolvedValue([
          { body_weight: 70, date: '2024-01-01' }
        ]);

        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(0);
      });

      it('debe usar INCREASE como default direction', async () => {
        const definition = {
          id_achievement_definition: 9,
          metric_type: 'BODY_WEIGHT_PROGRESS',
          target_value: 10,
          metadata: {}
        };

        Progress.findAll.mockResolvedValue([
          { body_weight: 70, date: '2024-01-01' },
          { body_weight: 72, date: '2024-02-01' }
        ]);

        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(2);
      });
    });

    describe('TOKEN_BALANCE_REACHED', () => {
      it('debe obtener balance actual de tokens', async () => {
        const definition = {
          id_achievement_definition: 10,
          metric_type: 'TOKEN_BALANCE_REACHED',
          target_value: 1000
        };

        UserProfile.findByPk.mockResolvedValue({
          tokens: 750
        });

        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(750);
      });

      it('debe manejar usuario sin tokens', async () => {
        const definition = {
          id_achievement_definition: 10,
          metric_type: 'TOKEN_BALANCE_REACHED',
          target_value: 1000
        };

        UserProfile.findByPk.mockResolvedValue({
          tokens: 0
        });

        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(0);
      });

      it('debe manejar usuario no encontrado', async () => {
        const definition = {
          id_achievement_definition: 10,
          metric_type: 'TOKEN_BALANCE_REACHED',
          target_value: 1000
        };

        UserProfile.findByPk.mockResolvedValue(null);
        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(0);
      });
    });

    describe('TOKEN_SPENT_TOTAL', () => {
      it('debe sumar tokens gastados', async () => {
        const definition = {
          id_achievement_definition: 11,
          metric_type: 'TOKEN_SPENT_TOTAL',
          target_value: 500
        };

        TokenLedger.sum.mockResolvedValue(-320);
        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(320);
        expect(TokenLedger.sum).toHaveBeenCalledWith('delta', {
          where: {
            id_user_profile: 42,
            delta: { lt: 0 }
          }
        });
      });

      it('debe manejar sin gastos', async () => {
        const definition = {
          id_achievement_definition: 11,
          metric_type: 'TOKEN_SPENT_TOTAL',
          target_value: 500
        };

        TokenLedger.sum.mockResolvedValue(null);
        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(0);
      });
    });

    describe('ONBOARDING_STEP_COMPLETED', () => {
      it('debe verificar paso de onboarding completado', async () => {
        const definition = {
          id_achievement_definition: 12,
          metric_type: 'ONBOARDING_STEP_COMPLETED',
          target_value: 1,
          metadata: { field: 'onboarding_completed' }
        };

        UserProfile.findByPk.mockResolvedValue({
          onboarding_completed: true
        });

        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(1);
      });

      it('debe usar campo default si no se especifica', async () => {
        const definition = {
          id_achievement_definition: 12,
          metric_type: 'ONBOARDING_STEP_COMPLETED',
          target_value: 1,
          metadata: {}
        };

        UserProfile.findByPk.mockResolvedValue({
          onboarding_completed: false
        });

        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(0);
      });

      it('debe manejar usuario no encontrado', async () => {
        const definition = {
          id_achievement_definition: 12,
          metric_type: 'ONBOARDING_STEP_COMPLETED',
          target_value: 1,
          metadata: { field: 'onboarding_completed' }
        };

        UserProfile.findByPk.mockResolvedValue(null);
        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(0);
      });
    });

    describe('Unsupported Metric Type', () => {
      it('debe manejar tipo de métrica no soportado', async () => {
        const definition = {
          id_achievement_definition: 99,
          metric_type: 'INVALID_METRIC',
          target_value: 100
        };

        UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

        const result = await achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        });

        expect(result.userAchievement.progress_value).toBe(0);
      });
    });
  });

  // ============================================
  // SYNC ACHIEVEMENT FOR USER
  // ============================================

  describe('syncAchievementForUser', () => {
    it('debe crear evento PROGRESS cuando hay cambio en progreso', async () => {
      const definition = {
        id_achievement_definition: 1,
        metric_type: 'STREAK_DAYS',
        target_value: 7
      };

      Streak.findOne.mockResolvedValue({ id_streak: 10, value: 5 });
      UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

      await achievementService.syncAchievementForUser({
        idUserProfile: 42,
        definition
      });

      expect(UserAchievementEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'PROGRESS',
          delta: 5,
          snapshot_value: 5
        }),
        expect.any(Object)
      );
    });

    it('debe crear evento UNLOCKED cuando se desbloquea', async () => {
      const definition = {
        id_achievement_definition: 1,
        metric_type: 'STREAK_DAYS',
        target_value: 7
      };

      Streak.findOne.mockResolvedValue({ id_streak: 10, value: 10 });
      UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

      await achievementService.syncAchievementForUser({
        idUserProfile: 42,
        definition
      });

      const eventCalls = UserAchievementEvent.create.mock.calls;
      const unlockedEvent = eventCalls.find(call => call[0].event_type === 'UNLOCKED');

      expect(unlockedEvent).toBeDefined();
      expect(unlockedEvent[0].snapshot_value).toBe(10);
    });

    it('debe crear evento RESET cuando se pierde el logro', async () => {
      const definition = {
        id_achievement_definition: 1,
        metric_type: 'STREAK_DAYS',
        target_value: 7
      };

      const unlockedAchievement = {
        ...mockUserAchievement,
        progress_value: 10,
        unlocked: true,
        unlocked_at: new Date()
      };

      Streak.findOne.mockResolvedValue({ id_streak: 10, value: 3 });
      UserAchievement.findOrCreate.mockResolvedValue([unlockedAchievement]);

      await achievementService.syncAchievementForUser({
        idUserProfile: 42,
        definition
      });

      const eventCalls = UserAchievementEvent.create.mock.calls;
      const resetEvent = eventCalls.find(call => call[0].event_type === 'RESET');

      expect(resetEvent).toBeDefined();
      expect(unlockedAchievement.unlocked).toBe(false);
      expect(unlockedAchievement.unlocked_at).toBe(null);
    });

    it('debe actualizar progress_denominator si cambió', async () => {
      const definition = {
        id_achievement_definition: 1,
        metric_type: 'STREAK_DAYS',
        target_value: 15
      };

      const achievement = {
        ...mockUserAchievement,
        progress_denominator: 10
      };

      Streak.findOne.mockResolvedValue({ id_streak: 10, value: 5 });
      UserAchievement.findOrCreate.mockResolvedValue([achievement]);

      await achievementService.syncAchievementForUser({
        idUserProfile: 42,
        definition
      });

      expect(achievement.progress_denominator).toBe(15);
      expect(achievement.save).toHaveBeenCalled();
    });

    it('debe actualizar metadata si cambió', async () => {
      const definition = {
        id_achievement_definition: 9,
        metric_type: 'BODY_WEIGHT_PROGRESS',
        target_value: 10,
        metadata: { direction: 'INCREASE' }
      };

      Progress.findAll.mockResolvedValue([
        { body_weight: 70, date: '2024-01-01' },
        { body_weight: 75, date: '2024-02-01' }
      ]);

      UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

      await achievementService.syncAchievementForUser({
        idUserProfile: 42,
        definition
      });

      expect(mockUserAchievement.metadata).toEqual({
        start: 70,
        latest: 75
      });
    });

    it('debe actualizar last_source_type y last_source_id', async () => {
      const definition = {
        id_achievement_definition: 1,
        metric_type: 'STREAK_DAYS',
        target_value: 7
      };

      Streak.findOne.mockResolvedValue({ id_streak: 99, value: 5 });
      UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

      await achievementService.syncAchievementForUser({
        idUserProfile: 42,
        definition
      });

      expect(mockUserAchievement.last_source_type).toBe('streak');
      expect(mockUserAchievement.last_source_id).toBe(99);
    });

    it('no debe persistir si no hay cambios', async () => {
      const definition = {
        id_achievement_definition: 1,
        metric_type: 'STREAK_DAYS',
        target_value: 7
      };

      const achievement = {
        ...mockUserAchievement,
        progress_value: 5,
        last_source_type: 'streak',
        last_source_id: 10
      };

      Streak.findOne.mockResolvedValue({ id_streak: 10, value: 5 });
      UserAchievement.findOrCreate.mockResolvedValue([achievement]);

      await achievementService.syncAchievementForUser({
        idUserProfile: 42,
        definition
      });

      expect(achievement.save).not.toHaveBeenCalled();
      expect(UserAchievementEvent.create).not.toHaveBeenCalled();
    });

    it('debe usar transaction externa si se provee', async () => {
      const externalTransaction = { commit: jest.fn(), rollback: jest.fn() };

      const definition = {
        id_achievement_definition: 1,
        metric_type: 'STREAK_DAYS',
        target_value: 7
      };

      Streak.findOne.mockResolvedValue({ id_streak: 10, value: 5 });
      UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

      await achievementService.syncAchievementForUser({
        idUserProfile: 42,
        definition,
        transaction: externalTransaction
      });

      expect(externalTransaction.commit).not.toHaveBeenCalled();
      expect(externalTransaction.rollback).not.toHaveBeenCalled();
    });

    it('debe hacer rollback en caso de error', async () => {
      const definition = {
        id_achievement_definition: 1,
        metric_type: 'STREAK_DAYS',
        target_value: 7
      };

      Streak.findOne.mockRejectedValue(new Error('DB Error'));
      UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

      await expect(
        achievementService.syncAchievementForUser({
          idUserProfile: 42,
          definition
        })
      ).rejects.toThrow('DB Error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  // ============================================
  // SYNC ALL ACHIEVEMENTS FOR USER
  // ============================================

  describe('syncAllAchievementsForUser', () => {
    it('debe sincronizar múltiples logros', async () => {
      const definitions = [
        { id_achievement_definition: 1, metric_type: 'STREAK_DAYS', target_value: 7 },
        { id_achievement_definition: 2, metric_type: 'ASSISTANCE_TOTAL', target_value: 50 }
      ];

      AchievementDefinition.findAll.mockResolvedValue(definitions);
      Streak.findOne.mockResolvedValue({ id_streak: 10, value: 5 });
      Assistance.count.mockResolvedValue(25);
      UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

      const results = await achievementService.syncAllAchievementsForUser(42);

      expect(results).toHaveLength(2);
      expect(results[0].definition).toEqual(definitions[0]);
      expect(results[1].definition).toEqual(definitions[1]);
    });

    it('debe filtrar por categoría', async () => {
      await achievementService.syncAllAchievementsForUser(42, {
        category: 'STREAK'
      });

      expect(AchievementDefinition.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'STREAK',
            is_active: true
          })
        })
      );
    });

    it('debe filtrar por múltiples categorías', async () => {
      await achievementService.syncAllAchievementsForUser(42, {
        categories: ['STREAK', 'ATTENDANCE']
      });

      expect(AchievementDefinition.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: { in: ['STREAK', 'ATTENDANCE'] }
          })
        })
      );
    });

    it('debe incluir inactivos si se especifica', async () => {
      await achievementService.syncAllAchievementsForUser(42, {
        includeInactive: true
      });

      const callArgs = AchievementDefinition.findAll.mock.calls[0][0];
      expect(callArgs.where.is_active).toBeUndefined();
    });

    it('debe manejar lista vacía de definiciones', async () => {
      AchievementDefinition.findAll.mockResolvedValue([]);

      const results = await achievementService.syncAllAchievementsForUser(42);

      expect(results).toEqual([]);
    });
  });

  // ============================================
  // GET USER ACHIEVEMENTS
  // ============================================

  describe('getUserAchievements', () => {
    it('debe retornar logros con información de progreso', async () => {
      const definitions = [
        {
          id_achievement_definition: 1,
          code: 'STREAK_7',
          target_value: 7,
          category: 'STREAK',
          get: jest.fn(function() { return this; })
        }
      ];

      AchievementDefinition.findAll.mockResolvedValue(definitions);
      UserAchievement.findAll.mockResolvedValue([
        {
          id_achievement_definition: 1,
          progress_value: 5,
          progress_denominator: 7,
          unlocked: false,
          unlocked_at: null,
          last_source_type: 'streak',
          last_source_id: 10
        }
      ]);

      const results = await achievementService.getUserAchievements(42);

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        definition: expect.objectContaining({ code: 'STREAK_7' }),
        progress: {
          value: 5,
          denominator: 7,
          percentage: expect.closeTo(0.714, 2)
        },
        unlocked: false,
        unlocked_at: null,
        last_source_type: 'streak',
        last_source_id: 10
      });
    });

    it('debe manejar logros desbloqueados', async () => {
      const definitions = [
        {
          id_achievement_definition: 1,
          code: 'STREAK_7',
          target_value: 7,
          get: jest.fn(function() { return this; })
        }
      ];

      const unlockedDate = new Date('2024-01-15');

      AchievementDefinition.findAll.mockResolvedValue(definitions);
      UserAchievement.findAll.mockResolvedValue([
        {
          id_achievement_definition: 1,
          progress_value: 10,
          progress_denominator: 7,
          unlocked: true,
          unlocked_at: unlockedDate,
          last_source_type: null,
          last_source_id: null
        }
      ]);

      const results = await achievementService.getUserAchievements(42);

      expect(results[0].unlocked).toBe(true);
      expect(results[0].unlocked_at).toBe(unlockedDate);
      expect(results[0].progress.percentage).toBe(1);
    });

    it('debe manejar logros sin progreso del usuario', async () => {
      const definitions = [
        {
          id_achievement_definition: 1,
          code: 'STREAK_7',
          target_value: 7,
          get: jest.fn(function() { return this; })
        }
      ];

      AchievementDefinition.findAll.mockResolvedValue(definitions);
      UserAchievement.findAll.mockResolvedValue([]);

      const results = await achievementService.getUserAchievements(42);

      expect(results).toHaveLength(1);
      expect(results[0].progress).toEqual({
        value: 0,
        denominator: 7,
        percentage: 0
      });
      expect(results[0].unlocked).toBe(false);
    });

    it('debe retornar array vacío si no hay definiciones', async () => {
      AchievementDefinition.findAll.mockResolvedValue([]);

      const results = await achievementService.getUserAchievements(42);

      expect(results).toEqual([]);
    });

    it('debe filtrar por categoría', async () => {
      AchievementDefinition.findAll.mockResolvedValue([]);

      await achievementService.getUserAchievements(42, { category: 'STREAK' });

      expect(AchievementDefinition.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'STREAK'
          })
        })
      );
    });
  });

  // ============================================
  // CREATE DEFINITION
  // ============================================

  describe('createDefinition', () => {
    it('debe crear definición válida', async () => {
      const payload = {
        code: 'test_achievement',
        name: 'Test Achievement',
        description: 'Test description',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 10,
        icon_url: 'https://example.com/icon.png',
        is_active: true
      };

      AchievementDefinition.findOne.mockResolvedValue(null);
      AchievementDefinition.create.mockResolvedValue({ id_achievement_definition: 1, ...payload });

      const result = await achievementService.createDefinition(payload);

      expect(result.code).toBe('TEST_ACHIEVEMENT');
      expect(AchievementDefinition.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'TEST_ACHIEVEMENT',
          name: 'Test Achievement',
          category: 'STREAK',
          metric_type: 'STREAK_DAYS',
          target_value: 10
        })
      );
    });

    it('debe normalizar código a mayúsculas', async () => {
      const payload = {
        code: 'test_code',
        name: 'Test',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 5
      };

      AchievementDefinition.findOne.mockResolvedValue(null);
      AchievementDefinition.create.mockResolvedValue({});

      await achievementService.createDefinition(payload);

      expect(AchievementDefinition.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'TEST_CODE'
        })
      );
    });

    it('debe rechazar código duplicado', async () => {
      const payload = {
        code: 'DUPLICATE',
        name: 'Test',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 5
      };

      AchievementDefinition.findOne.mockResolvedValue({ code: 'DUPLICATE' });

      await expect(
        achievementService.createDefinition(payload)
      ).rejects.toThrow(ConflictError);
    });

    it('debe validar campo code requerido', async () => {
      const payload = {
        name: 'Test',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 5
      };

      await expect(
        achievementService.createDefinition(payload)
      ).rejects.toThrow(ValidationError);
    });

    it('debe validar campo name requerido', async () => {
      const payload = {
        code: 'TEST',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 5
      };

      await expect(
        achievementService.createDefinition(payload)
      ).rejects.toThrow(ValidationError);
    });

    it('debe validar categoría válida', async () => {
      const payload = {
        code: 'TEST',
        name: 'Test',
        category: 'INVALID_CATEGORY',
        metric_type: 'STREAK_DAYS',
        target_value: 5
      };

      await expect(
        achievementService.createDefinition(payload)
      ).rejects.toThrow(ValidationError);
    });

    it('debe validar metric_type válido', async () => {
      const payload = {
        code: 'TEST',
        name: 'Test',
        category: 'STREAK',
        metric_type: 'INVALID_METRIC',
        target_value: 5
      };

      await expect(
        achievementService.createDefinition(payload)
      ).rejects.toThrow(ValidationError);
    });

    it('debe validar target_value sea entero positivo', async () => {
      const payload = {
        code: 'TEST',
        name: 'Test',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: -5
      };

      await expect(
        achievementService.createDefinition(payload)
      ).rejects.toThrow(ValidationError);
    });

    it('debe validar longitud máxima de code', async () => {
      const payload = {
        code: 'A'.repeat(51),
        name: 'Test',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 5
      };

      await expect(
        achievementService.createDefinition(payload)
      ).rejects.toThrow(ValidationError);
    });

    it('debe validar longitud máxima de name', async () => {
      const payload = {
        code: 'TEST',
        name: 'A'.repeat(121),
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 5
      };

      await expect(
        achievementService.createDefinition(payload)
      ).rejects.toThrow(ValidationError);
    });

    it('debe validar longitud máxima de icon_url', async () => {
      const payload = {
        code: 'TEST',
        name: 'Test',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 5,
        icon_url: 'https://' + 'a'.repeat(500)
      };

      await expect(
        achievementService.createDefinition(payload)
      ).rejects.toThrow(ValidationError);
    });

    it('debe permitir metadata como objeto JSON', async () => {
      const payload = {
        code: 'TEST',
        name: 'Test',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 5,
        metadata: { custom: 'value' }
      };

      AchievementDefinition.findOne.mockResolvedValue(null);
      AchievementDefinition.create.mockResolvedValue({});

      await achievementService.createDefinition(payload);

      expect(AchievementDefinition.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { custom: 'value' }
        })
      );
    });

    it('debe rechazar metadata inválido', async () => {
      const payload = {
        code: 'TEST',
        name: 'Test',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 5,
        metadata: 'invalid string'
      };

      await expect(
        achievementService.createDefinition(payload)
      ).rejects.toThrow(ValidationError);
    });

    it('debe establecer valores por defecto', async () => {
      const payload = {
        code: 'TEST',
        name: 'Test',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 5
      };

      AchievementDefinition.findOne.mockResolvedValue(null);
      AchievementDefinition.create.mockResolvedValue({});

      await achievementService.createDefinition(payload);

      expect(AchievementDefinition.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: null,
          metadata: null,
          icon_url: null,
          is_active: true
        })
      );
    });
  });

  // ============================================
  // UPDATE DEFINITION
  // ============================================

  describe('updateDefinition', () => {
    it('debe actualizar definición existente', async () => {
      const existing = {
        id_achievement_definition: 1,
        code: 'TEST',
        name: 'Original Name',
        target_value: 10,
        save: jest.fn().mockResolvedValue(true)
      };

      AchievementDefinition.findByPk.mockResolvedValue(existing);

      const result = await achievementService.updateDefinition(1, {
        name: 'Updated Name'
      });

      expect(existing.name).toBe('Updated Name');
      expect(existing.save).toHaveBeenCalled();
    });

    it('debe rechazar ID inexistente', async () => {
      AchievementDefinition.findByPk.mockResolvedValue(null);

      await expect(
        achievementService.updateDefinition(999, { name: 'Test' })
      ).rejects.toThrow(NotFoundError);
    });

    it('debe permitir actualización parcial', async () => {
      const existing = {
        id_achievement_definition: 1,
        code: 'TEST',
        name: 'Original',
        target_value: 10,
        save: jest.fn().mockResolvedValue(true)
      };

      AchievementDefinition.findByPk.mockResolvedValue(existing);

      await achievementService.updateDefinition(1, {
        description: 'New description'
      });

      expect(existing.description).toBe('New description');
      expect(existing.name).toBe('Original');
    });

    it('debe validar código duplicado en actualización', async () => {
      const existing = {
        id_achievement_definition: 1,
        code: 'TEST1',
        save: jest.fn()
      };

      AchievementDefinition.findByPk.mockResolvedValue(existing);
      AchievementDefinition.findOne.mockResolvedValue({ id_achievement_definition: 2, code: 'TEST2' });

      await expect(
        achievementService.updateDefinition(1, { code: 'TEST2' })
      ).rejects.toThrow(ConflictError);
    });

    it('debe actualizar UserAchievements si cambia target_value', async () => {
      const existing = {
        id_achievement_definition: 1,
        code: 'TEST',
        target_value: 10,
        save: jest.fn().mockResolvedValue(true)
      };

      AchievementDefinition.findByPk.mockResolvedValue(existing);
      UserAchievement.update.mockResolvedValue([1]);

      await achievementService.updateDefinition(1, {
        target_value: 20
      });

      expect(UserAchievement.update).toHaveBeenCalledWith(
        { progress_denominator: 20 },
        { where: { id_achievement_definition: 1 } }
      );
    });

    it('no debe actualizar UserAchievements si target_value no cambió', async () => {
      const existing = {
        id_achievement_definition: 1,
        code: 'TEST',
        target_value: 10,
        save: jest.fn().mockResolvedValue(true)
      };

      AchievementDefinition.findByPk.mockResolvedValue(existing);

      await achievementService.updateDefinition(1, {
        name: 'New Name'
      });

      expect(UserAchievement.update).not.toHaveBeenCalled();
    });

    it('debe normalizar código a mayúsculas en update', async () => {
      const existing = {
        id_achievement_definition: 1,
        code: 'OLD_CODE',
        save: jest.fn().mockResolvedValue(true)
      };

      AchievementDefinition.findByPk.mockResolvedValue(existing);
      AchievementDefinition.findOne.mockResolvedValue(null);

      await achievementService.updateDefinition(1, {
        code: 'new_code'
      });

      expect(existing.code).toBe('NEW_CODE');
    });
  });

  // ============================================
  // DELETE DEFINITION
  // ============================================

  describe('deleteDefinition', () => {
    it('debe eliminar definición existente', async () => {
      const existing = {
        id_achievement_definition: 1,
        code: 'TEST',
        destroy: jest.fn().mockResolvedValue(true)
      };

      AchievementDefinition.findByPk.mockResolvedValue(existing);

      const result = await achievementService.deleteDefinition(1);

      expect(existing.destroy).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('debe rechazar ID inexistente', async () => {
      AchievementDefinition.findByPk.mockResolvedValue(null);

      await expect(
        achievementService.deleteDefinition(999)
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ============================================
  // GET DEFINITIONS
  // ============================================

  describe('getDefinitions', () => {
    it('debe retornar todas las definiciones activas por defecto', async () => {
      await achievementService.getDefinitions();

      expect(AchievementDefinition.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { is_active: true },
          order: [['category', 'ASC'], ['target_value', 'ASC']]
        })
      );
    });

    it('debe filtrar por categoría', async () => {
      await achievementService.getDefinitions({ category: 'STREAK' });

      expect(AchievementDefinition.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            is_active: true,
            category: 'STREAK'
          }
        })
      );
    });

    it('debe filtrar por múltiples categorías', async () => {
      await achievementService.getDefinitions({
        categories: ['STREAK', 'ATTENDANCE']
      });

      expect(AchievementDefinition.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            is_active: true,
            category: { in: ['STREAK', 'ATTENDANCE'] }
          }
        })
      );
    });

    it('debe incluir inactivos cuando se especifica', async () => {
      await achievementService.getDefinitions({
        includeInactive: true
      });

      const callArgs = AchievementDefinition.findAll.mock.calls[0][0];
      expect(callArgs.where.is_active).toBeUndefined();
    });

    it('debe ordenar por categoría y target_value', async () => {
      await achievementService.getDefinitions();

      expect(AchievementDefinition.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['category', 'ASC'], ['target_value', 'ASC']]
        })
      );
    });
  });

  // ============================================
  // EDGE CASES Y VALIDACIONES
  // ============================================

  describe('Edge Cases', () => {
    it('debe manejar progreso exactamente igual al target', async () => {
      const definition = {
        id_achievement_definition: 1,
        metric_type: 'STREAK_DAYS',
        target_value: 7
      };

      Streak.findOne.mockResolvedValue({ id_streak: 10, value: 7 });
      UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

      const result = await achievementService.syncAchievementForUser({
        idUserProfile: 42,
        definition
      });

      expect(result.unlocked).toBe(true);
      expect(result.userAchievement.progress_value).toBe(7);
    });

    it('debe manejar target_value de 0', async () => {
      const definition = {
        id_achievement_definition: 1,
        metric_type: 'ONBOARDING_STEP_COMPLETED',
        target_value: 0
      };

      UserProfile.findByPk.mockResolvedValue({ onboarding_completed: true });
      UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

      const result = await achievementService.syncAchievementForUser({
        idUserProfile: 42,
        definition
      });

      expect(result.unlocked).toBe(true);
    });

    it('debe manejar valores negativos en calculators', async () => {
      const definition = {
        id_achievement_definition: 9,
        metric_type: 'BODY_WEIGHT_PROGRESS',
        target_value: 10,
        metadata: { direction: 'INCREASE' }
      };

      Progress.findAll.mockResolvedValue([
        { body_weight: 75, date: '2024-01-01' },
        { body_weight: 70, date: '2024-02-01' }
      ]);

      UserAchievement.findOrCreate.mockResolvedValue([mockUserAchievement]);

      const result = await achievementService.syncAchievementForUser({
        idUserProfile: 42,
        definition
      });

      expect(result.userAchievement.progress_value).toBe(0);
    });

    it('debe manejar metadata nulo', async () => {
      const payload = {
        code: 'TEST',
        name: 'Test',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 5,
        metadata: null
      };

      AchievementDefinition.findOne.mockResolvedValue(null);
      AchievementDefinition.create.mockResolvedValue({});

      await achievementService.createDefinition(payload);

      expect(AchievementDefinition.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: null
        })
      );
    });

    it('debe trimear strings en validación', async () => {
      const payload = {
        code: '  TEST_CODE  ',
        name: '  Test Name  ',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 5
      };

      AchievementDefinition.findOne.mockResolvedValue(null);
      AchievementDefinition.create.mockResolvedValue({});

      await achievementService.createDefinition(payload);

      expect(AchievementDefinition.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'TEST_CODE',
          name: 'Test Name'
        })
      );
    });

    it('debe rechazar payload inválido', async () => {
      await expect(
        achievementService.createDefinition(null)
      ).rejects.toThrow(ValidationError);

      await expect(
        achievementService.createDefinition('invalid')
      ).rejects.toThrow(ValidationError);
    });

    it('debe manejar categorías en minúsculas', async () => {
      const payload = {
        code: 'TEST',
        name: 'Test',
        category: 'streak',
        metric_type: 'STREAK_DAYS',
        target_value: 5
      };

      AchievementDefinition.findOne.mockResolvedValue(null);
      AchievementDefinition.create.mockResolvedValue({});

      await achievementService.createDefinition(payload);

      expect(AchievementDefinition.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'STREAK'
        })
      );
    });
  });
});
