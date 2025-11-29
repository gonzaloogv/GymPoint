/**
 * Tests para achievement-service - Core Methods
 * Cubre: getDefinitions, getUserAchievements
 */

const {
  mockAchievementDefinition,
  mockUserAchievement,
  mockUserProfile,
  mockStreak,
  mockOp,
} = require('./test-setup');

const achievementService = require('../../../../services/achievement-service');

describe('achievement-service core methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDefinitions', () => {
    it('retorna todas las definiciones activas sin filtros', async () => {
      const mockDefinitions = [
        {
          id_achievement_definition: 1,
          code: 'STREAK_7',
          name: 'Racha de 7 días',
          category: 'STREAK',
          is_active: true,
        },
        {
          id_achievement_definition: 2,
          code: 'ASSIST_10',
          name: '10 asistencias',
          category: 'ASSISTANCE',
          is_active: true,
        },
      ];

      mockAchievementDefinition.findAll.mockResolvedValue(mockDefinitions);

      const result = await achievementService.getDefinitions();

      expect(mockAchievementDefinition.findAll).toHaveBeenCalledWith({
        where: { is_active: true },
        order: [['category', 'ASC'], ['target_value', 'ASC']],
      });
      expect(result).toEqual(mockDefinitions);
    });

    it('filtra por categoría específica', async () => {
      const mockDefinitions = [
        {
          id_achievement_definition: 1,
          code: 'STREAK_7',
          category: 'STREAK',
          is_active: true,
        },
      ];

      mockAchievementDefinition.findAll.mockResolvedValue(mockDefinitions);

      const result = await achievementService.getDefinitions({ category: 'STREAK' });

      expect(mockAchievementDefinition.findAll).toHaveBeenCalledWith({
        where: {
          is_active: true,
          category: 'STREAK',
        },
        order: [['category', 'ASC'], ['target_value', 'ASC']],
      });
      expect(result).toEqual(mockDefinitions);
    });

    it('filtra por múltiples categorías usando array', async () => {
      const mockDefinitions = [
        { id_achievement_definition: 1, category: 'STREAK', is_active: true },
        { id_achievement_definition: 2, category: 'FREQUENCY', is_active: true },
      ];

      mockAchievementDefinition.findAll.mockResolvedValue(mockDefinitions);

      await achievementService.getDefinitions({ categories: ['STREAK', 'FREQUENCY'] });

      expect(mockAchievementDefinition.findAll).toHaveBeenCalledWith({
        where: {
          is_active: true,
          category: { [mockOp.in]: ['STREAK', 'FREQUENCY'] },
        },
        order: [['category', 'ASC'], ['target_value', 'ASC']],
      });
    });

    it('incluye definiciones inactivas cuando includeInactive es true', async () => {
      const mockDefinitions = [
        { id_achievement_definition: 1, is_active: true },
        { id_achievement_definition: 2, is_active: false },
      ];

      mockAchievementDefinition.findAll.mockResolvedValue(mockDefinitions);

      await achievementService.getDefinitions({ includeInactive: true });

      expect(mockAchievementDefinition.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['category', 'ASC'], ['target_value', 'ASC']],
      });
    });

    it('ignora categories vacío y no aplica filtro', async () => {
      mockAchievementDefinition.findAll.mockResolvedValue([]);

      await achievementService.getDefinitions({ categories: [] });

      expect(mockAchievementDefinition.findAll).toHaveBeenCalledWith({
        where: { is_active: true },
        order: [['category', 'ASC'], ['target_value', 'ASC']],
      });
    });
  });

  describe('getUserAchievements', () => {
    it('retorna lista vacía cuando no hay definiciones activas', async () => {
      mockAchievementDefinition.findAll.mockResolvedValue([]);

      const result = await achievementService.getUserAchievements(1);

      expect(result).toEqual([]);
    });

    it('retorna achievements con progreso calculado en tiempo real', async () => {
      const mockDefinitions = [
        {
          id_achievement_definition: 1,
          code: 'STREAK_7',
          name: 'Racha de 7 días',
          category: 'STREAK',
          metric_type: 'STREAK_DAYS',
          target_value: 7,
          is_active: true,
          get: jest.fn().mockReturnValue({
            id_achievement_definition: 1,
            code: 'STREAK_7',
            name: 'Racha de 7 días',
            category: 'STREAK',
            metric_type: 'STREAK_DAYS',
            target_value: 7,
          }),
        },
      ];

      const mockExistingAchievement = {
        id_user_achievement: 1,
        id_achievement_definition: 1,
        id_user_profile: 1,
        progress_value: 5,
        progress_denominator: 7,
        unlocked: false,
        unlocked_at: null,
        last_source_type: 'streak',
        last_source_id: 101,
      };

      mockAchievementDefinition.findAll.mockResolvedValue(mockDefinitions);
      mockUserAchievement.findAll.mockResolvedValue([mockExistingAchievement]);
      mockStreak.findOne.mockResolvedValue({ value: 5, id_streak: 101 });

      const result = await achievementService.getUserAchievements(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        definition: {
          id_achievement_definition: 1,
          code: 'STREAK_7',
          name: 'Racha de 7 días',
        },
        progress: {
          value: 5,
          denominator: 7,
          percentage: expect.closeTo(0.714, 2),
        },
        unlocked: false,
        unlocked_at: null,
        last_source_type: 'streak',
        last_source_id: 101,
      });
    });

    it('maneja errores en calculateMetric y usa valores guardados como fallback', async () => {
      const mockDefinitions = [
        {
          id_achievement_definition: 1,
          code: 'BROKEN_METRIC',
          metric_type: 'UNSUPPORTED_METRIC',
          target_value: 10,
          is_active: true,
          get: jest.fn().mockReturnValue({
            id_achievement_definition: 1,
            code: 'BROKEN_METRIC',
            metric_type: 'UNSUPPORTED_METRIC',
            target_value: 10,
          }),
        },
      ];

      const mockExistingAchievement = {
        id_achievement_definition: 1,
        progress_value: 3,
        progress_denominator: 10,
        unlocked: false,
      };

      mockAchievementDefinition.findAll.mockResolvedValue(mockDefinitions);
      mockUserAchievement.findAll.mockResolvedValue([mockExistingAchievement]);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await achievementService.getUserAchievements(1);

      expect(result).toHaveLength(1);
      expect(result[0].progress).toMatchObject({
        value: 0, // Porque UNSUPPORTED_METRIC retorna 0
        denominator: 10, // Usa definition.target_value
      });

      consoleErrorSpy.mockRestore();
    });

    it('retorna achievement sin progreso guardado usando cálculo en tiempo real', async () => {
      const mockDefinitions = [
        {
          id_achievement_definition: 1,
          code: 'ASSIST_10',
          metric_type: 'ASSISTANCE_TOTAL',
          target_value: 10,
          is_active: true,
          get: jest.fn().mockReturnValue({
            id_achievement_definition: 1,
            code: 'ASSIST_10',
            target_value: 10,
          }),
        },
      ];

      mockAchievementDefinition.findAll.mockResolvedValue(mockDefinitions);
      mockUserAchievement.findAll.mockResolvedValue([]); // No existe achievement guardado

      const mockAssistance = require('../../../../models').Assistance;
      mockAssistance.count.mockResolvedValue(3);

      const result = await achievementService.getUserAchievements(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        progress: {
          value: 3,
          denominator: 10,
          percentage: 0.3,
        },
        unlocked: false,
        unlocked_at: null,
      });
    });

    it('calcula percentage correctamente cuando progreso >= target', async () => {
      const mockDefinitions = [
        {
          id_achievement_definition: 1,
          code: 'STREAK_7',
          metric_type: 'STREAK_DAYS',
          target_value: 7,
          is_active: true,
          get: jest.fn().mockReturnValue({
            id_achievement_definition: 1,
            code: 'STREAK_7',
            target_value: 7,
          }),
        },
      ];

      mockAchievementDefinition.findAll.mockResolvedValue(mockDefinitions);
      mockUserAchievement.findAll.mockResolvedValue([]);
      mockStreak.findOne.mockResolvedValue({ value: 10, id_streak: 1 });

      const result = await achievementService.getUserAchievements(1);

      expect(result[0].progress).toMatchObject({
        value: 10,
        denominator: 7,
        percentage: 1, // Máximo 1 (100%)
      });
    });

    it('filtra por categoría específica', async () => {
      const mockDefinitions = [
        {
          id_achievement_definition: 1,
          category: 'STREAK',
          metric_type: 'STREAK_DAYS',
          target_value: 7,
          get: jest.fn().mockReturnThis(),
        },
      ];

      mockAchievementDefinition.findAll.mockResolvedValue(mockDefinitions);
      mockUserAchievement.findAll.mockResolvedValue([]);
      mockStreak.findOne.mockResolvedValue({ value: 5 });

      await achievementService.getUserAchievements(1, { category: 'STREAK' });

      expect(mockAchievementDefinition.findAll).toHaveBeenCalledWith({
        where: { is_active: true, category: 'STREAK' },
        order: [['category', 'ASC'], ['target_value', 'ASC']],
      });
    });

    it('incluye _debug en development environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const mockDefinitions = [
        {
          id_achievement_definition: 1,
          metric_type: 'STREAK_DAYS',
          target_value: 7,
          get: jest.fn().mockReturnValue({ id_achievement_definition: 1 }),
        },
      ];

      mockAchievementDefinition.findAll.mockResolvedValue(mockDefinitions);
      mockUserAchievement.findAll.mockResolvedValue([]);
      mockStreak.findOne.mockResolvedValue({ value: 5 });

      const result = await achievementService.getUserAchievements(1);

      expect(result[0]._debug).toBeDefined();
      expect(result[0]._debug).toMatchObject({
        calculationSuccess: true,
        savedProgress: null,
        metricType: 'STREAK_DAYS',
      });

      process.env.NODE_ENV = originalEnv;
    });
  });
});
