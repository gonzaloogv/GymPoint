/**
 * Tests para achievement-service - Metric Calculators
 * Cubre todos los METRIC_CALCULATORS internos mediante getUserAchievements
 */

const {
  mockAchievementDefinition,
  mockUserAchievement,
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
  mockOp,
} = require('./test-setup');

const achievementService = require('../../../../services/achievement-service');

describe('achievement-service metric calculators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserAchievement.findAll.mockResolvedValue([]);
  });

  const createMockDefinition = (overrides) => ({
    id_achievement_definition: 1,
    code: 'TEST',
    metric_type: 'STREAK_DAYS',
    target_value: 10,
    get: jest.fn(function() { return this; }),
    ...overrides,
  });

  describe('STREAK_DAYS calculator', () => {
    it('retorna valor de streak cuando existe', async () => {
      const definition = createMockDefinition({
        metric_type: 'STREAK_DAYS',
        target_value: 7,
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockStreak.findOne.mockResolvedValue({ value: 5, id_streak: 101 });

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(5);
      expect(mockStreak.findOne).toHaveBeenCalledWith({
        where: { id_user_profile: 1 },
      });
    });

    it('retorna 0 cuando no hay streak', async () => {
      const definition = createMockDefinition({
        metric_type: 'STREAK_DAYS',
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockStreak.findOne.mockResolvedValue(null);

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(0);
    });
  });

  describe('STREAK_RECOVERY_USED calculator', () => {
    it('retorna recovery_items_used cuando existe', async () => {
      const definition = createMockDefinition({
        metric_type: 'STREAK_RECOVERY_USED',
        target_value: 3,
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockStreak.findOne.mockResolvedValue({ recovery_items_used: 2, id_streak: 101 });

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(2);
    });

    it('retorna 0 cuando no hay streak', async () => {
      const definition = createMockDefinition({
        metric_type: 'STREAK_RECOVERY_USED',
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockStreak.findOne.mockResolvedValue(null);

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(0);
    });
  });

  describe('ASSISTANCE_TOTAL calculator', () => {
    it('cuenta todas las asistencias del usuario', async () => {
      const definition = createMockDefinition({
        metric_type: 'ASSISTANCE_TOTAL',
        target_value: 10,
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockAssistance.count.mockResolvedValue(8);

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(8);
      expect(mockAssistance.count).toHaveBeenCalledWith({
        where: { id_user_profile: 1 },
      });
    });
  });

  describe('FREQUENCY_WEEKS_MET calculator', () => {
    it('cuenta semanas con goal_met=true', async () => {
      const definition = createMockDefinition({
        metric_type: 'FREQUENCY_WEEKS_MET',
        target_value: 4,
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockFrequencyHistory.count.mockResolvedValue(3);

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(3);
      expect(mockFrequencyHistory.count).toHaveBeenCalledWith({
        where: {
          id_user_profile: 1,
          goal_met: true,
        },
      });
    });
  });

  describe('ROUTINE_COMPLETED_COUNT calculator', () => {
    it('cuenta rutinas con finish_date no nulo', async () => {
      const definition = createMockDefinition({
        metric_type: 'ROUTINE_COMPLETED_COUNT',
        target_value: 5,
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockUserRoutine.count.mockResolvedValue(2);

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(2);
      expect(mockUserRoutine.count).toHaveBeenCalledWith({
        where: {
          id_user_profile: 1,
          finish_date: { [mockOp.ne]: null },
        },
      });
    });
  });

  describe('WORKOUT_SESSION_COMPLETED calculator', () => {
    it('cuenta sesiones con status COMPLETED', async () => {
      const definition = createMockDefinition({
        metric_type: 'WORKOUT_SESSION_COMPLETED',
        target_value: 10,
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockWorkoutSession.count.mockResolvedValue(7);

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(7);
      expect(mockWorkoutSession.count).toHaveBeenCalledWith({
        where: {
          id_user_profile: 1,
          status: 'COMPLETED',
        },
      });
    });
  });

  describe('DAILY_CHALLENGE_COMPLETED_COUNT calculator', () => {
    it('cuenta desafíos completados', async () => {
      const definition = createMockDefinition({
        metric_type: 'DAILY_CHALLENGE_COMPLETED_COUNT',
        target_value: 30,
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockUserDailyChallenge.count.mockResolvedValue(15);

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(15);
      expect(mockUserDailyChallenge.count).toHaveBeenCalledWith({
        where: {
          id_user_profile: 1,
          completed: true,
        },
      });
    });
  });

  describe('PR_RECORD_COUNT calculator', () => {
    it('cuenta registros de PR cuando hay progreso', async () => {
      const definition = createMockDefinition({
        metric_type: 'PR_RECORD_COUNT',
        target_value: 20,
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockProgress.findAll.mockResolvedValue([
        { id_progress: 1 },
        { id_progress: 2 },
      ]);
      mockProgressExercise.count.mockResolvedValue(5);

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(5);
      expect(mockProgress.findAll).toHaveBeenCalledWith({
        attributes: ['id_progress'],
        where: { id_user_profile: 1 },
      });
      expect(mockProgressExercise.count).toHaveBeenCalledWith({
        where: {
          id_progress: {
            [mockOp.in]: [1, 2],
          },
        },
      });
    });

    it('retorna 0 cuando no hay progress entries', async () => {
      const definition = createMockDefinition({
        metric_type: 'PR_RECORD_COUNT',
        target_value: 20,
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockProgress.findAll.mockResolvedValue([]);

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(0);
      expect(mockProgressExercise.count).not.toHaveBeenCalled();
    });
  });

  describe('BODY_WEIGHT_PROGRESS calculator', () => {
    it('calcula delta positivo con direction INCREASE', async () => {
      const definition = createMockDefinition({
        metric_type: 'BODY_WEIGHT_PROGRESS',
        target_value: 5,
        metadata: { direction: 'INCREASE' },
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockProgress.findAll.mockResolvedValue([
        { body_weight: 70, date: '2025-01-01' },
        { body_weight: 75, date: '2025-01-31' },
      ]);

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(5);
    });

    it('calcula delta positivo con direction DECREASE', async () => {
      const definition = createMockDefinition({
        metric_type: 'BODY_WEIGHT_PROGRESS',
        target_value: 5,
        metadata: { direction: 'DECREASE' },
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockProgress.findAll.mockResolvedValue([
        { body_weight: 80, date: '2025-01-01' },
        { body_weight: 75, date: '2025-01-31' },
      ]);

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(5);
    });

    it('retorna 0 cuando hay menos de 2 entradas', async () => {
      const definition = createMockDefinition({
        metric_type: 'BODY_WEIGHT_PROGRESS',
        target_value: 5,
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockProgress.findAll.mockResolvedValue([{ body_weight: 70 }]);

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(0);
    });
  });

  describe('TOKEN_BALANCE_REACHED calculator', () => {
    it('retorna balance de tokens del usuario', async () => {
      const definition = createMockDefinition({
        metric_type: 'TOKEN_BALANCE_REACHED',
        target_value: 1000,
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockUserProfile.findByPk.mockResolvedValue({ tokens: 750 });

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(750);
      expect(mockUserProfile.findByPk).toHaveBeenCalledWith(1, {
        attributes: ['tokens'],
      });
    });

    it('retorna 0 cuando no hay perfil', async () => {
      const definition = createMockDefinition({
        metric_type: 'TOKEN_BALANCE_REACHED',
        target_value: 1000,
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockUserProfile.findByPk.mockResolvedValue(null);

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(0);
    });
  });

  describe('TOKEN_SPENT_TOTAL calculator', () => {
    it('suma tokens gastados (deltas negativos)', async () => {
      const definition = createMockDefinition({
        metric_type: 'TOKEN_SPENT_TOTAL',
        target_value: 500,
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockTokenLedger.sum.mockResolvedValue(-300);

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(300);
      expect(mockTokenLedger.sum).toHaveBeenCalledWith('delta', {
        where: {
          id_user_profile: 1,
          delta: { [mockOp.lt]: 0 },
        },
      });
    });

    it('retorna 0 cuando no hay gastos', async () => {
      const definition = createMockDefinition({
        metric_type: 'TOKEN_SPENT_TOTAL',
        target_value: 500,
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockTokenLedger.sum.mockResolvedValue(null);

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(0);
    });
  });

  describe('ONBOARDING_STEP_COMPLETED calculator', () => {
    it('retorna 1 cuando el campo existe y es true', async () => {
      const definition = createMockDefinition({
        metric_type: 'ONBOARDING_STEP_COMPLETED',
        target_value: 1,
        metadata: { field: 'onboarding_completed' },
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockUserProfile.findByPk.mockResolvedValue({
        onboarding_completed: true,
      });

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(1);
    });

    it('retorna 0 cuando el campo es false', async () => {
      const definition = createMockDefinition({
        metric_type: 'ONBOARDING_STEP_COMPLETED',
        target_value: 1,
        metadata: { field: 'onboarding_completed' },
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockUserProfile.findByPk.mockResolvedValue({
        onboarding_completed: false,
      });

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(0);
    });

    it('retorna 0 cuando no hay perfil', async () => {
      const definition = createMockDefinition({
        metric_type: 'ONBOARDING_STEP_COMPLETED',
        target_value: 1,
      });

      mockAchievementDefinition.findAll.mockResolvedValue([definition]);
      mockUserProfile.findByPk.mockResolvedValue(null);

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress.value).toBe(0);
    });
  });
});
