/**
 * Tests para achievement-service - Sync Methods
 * Cubre: syncAchievementForUser, syncAllAchievementsForUser
 */

const {
  mockSequelize,
  mockTransaction,
  mockAchievementDefinition,
  mockUserAchievement,
  mockUserAchievementEvent,
  mockStreak,
  mockAssistance,
} = require('./test-setup');

const achievementService = require('../../../../services/achievement-service');

describe('achievement-service sync methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
    mockTransaction.commit.mockResolvedValue();
    mockTransaction.rollback.mockResolvedValue();
  });

  describe('syncAchievementForUser', () => {
    it('crea user_achievement y registra progreso inicial', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        code: 'STREAK_7',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
      };

      const mockUserAch = {
        id_user_achievement: 1,
        id_user_profile: 1,
        id_achievement_definition: 1,
        progress_value: 0,
        progress_denominator: 7,
        unlocked: false,
        save: jest.fn().mockResolvedValue(),
      };

      mockUserAchievement.findOrCreate.mockResolvedValue([mockUserAch, true]);
      mockStreak.findOne.mockResolvedValue({ value: 3, id_streak: 101 });
      mockUserAchievementEvent.create.mockResolvedValue();

      const result = await achievementService.syncAchievementForUser({
        idUserProfile: 1,
        definition: mockDefinition,
        sourceType: 'streak',
        sourceId: 101,
      });

      expect(mockUserAchievement.findOrCreate).toHaveBeenCalled();
      expect(mockUserAchievementEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'PROGRESS',
          delta: 3,
          snapshot_value: 3,
          source_type: 'streak',
          source_id: 101,
        }),
        { transaction: mockTransaction }
      );
      expect(mockUserAch.save).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toMatchObject({
        definition: mockDefinition,
        userAchievement: mockUserAch,
        unlocked: false,
        progressDelta: 3,
        justUnlocked: false,
      });
    });

    it('actualiza progreso existente sin cambiar unlocked (desbloqueo manual)', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        metric_type: 'ASSISTANCE_TOTAL',
        target_value: 10,
      };

      const mockUserAch = {
        id_user_achievement: 1,
        progress_value: 5,
        progress_denominator: 10,
        unlocked: false,
        save: jest.fn().mockResolvedValue(),
      };

      mockUserAchievement.findOrCreate.mockResolvedValue([mockUserAch, false]);
      mockAssistance.count.mockResolvedValue(8);
      mockUserAchievementEvent.create.mockResolvedValue();

      const result = await achievementService.syncAchievementForUser({
        idUserProfile: 1,
        definition: mockDefinition,
      });

      expect(mockUserAch.progress_value).toBe(8);
      expect(mockUserAch.unlocked).toBe(false); // NO se desbloquea automáticamente
      expect(mockUserAch.save).toHaveBeenCalled();
      expect(result.progressDelta).toBe(3);
      expect(result.justUnlocked).toBe(false);
    });

    it('no persiste si no hay cambios en progreso', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        metric_type: 'STREAK_DAYS',
        target_value: 7,
      };

      const mockUserAch = {
        id_user_achievement: 1,
        progress_value: 5,
        progress_denominator: 7,
        unlocked: false,
        last_source_type: 'streak',
        last_source_id: 101,
        metadata: null,
        save: jest.fn().mockResolvedValue(),
      };

      mockUserAchievement.findOrCreate.mockResolvedValue([mockUserAch, false]);
      mockStreak.findOne.mockResolvedValue({ value: 5, id_streak: 101 });

      await achievementService.syncAchievementForUser({
        idUserProfile: 1,
        definition: mockDefinition,
        sourceType: 'streak',
        sourceId: 101,
      });

      expect(mockUserAch.save).not.toHaveBeenCalled();
      expect(mockUserAchievementEvent.create).not.toHaveBeenCalled();
    });

    it('actualiza denominator si target_value cambió', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        metric_type: 'STREAK_DAYS',
        target_value: 10, // Cambió de 7 a 10
      };

      const mockUserAch = {
        id_user_achievement: 1,
        progress_value: 5,
        progress_denominator: 7, // Valor anterior
        unlocked: false,
        save: jest.fn().mockResolvedValue(),
      };

      mockUserAchievement.findOrCreate.mockResolvedValue([mockUserAch, false]);
      mockStreak.findOne.mockResolvedValue({ value: 5 });
      mockUserAchievementEvent.create.mockResolvedValue();

      await achievementService.syncAchievementForUser({
        idUserProfile: 1,
        definition: mockDefinition,
      });

      expect(mockUserAch.progress_denominator).toBe(10);
      expect(mockUserAch.save).toHaveBeenCalled();
    });

    it('usa transaction provista externamente sin commit', async () => {
      const externalTransaction = { ...mockTransaction };
      const mockDefinition = {
        id_achievement_definition: 1,
        metric_type: 'STREAK_DAYS',
        target_value: 7,
      };

      const mockUserAch = {
        progress_value: 0,
        progress_denominator: 7,
        unlocked: false,
        save: jest.fn().mockResolvedValue(),
      };

      mockUserAchievement.findOrCreate.mockResolvedValue([mockUserAch, true]);
      mockStreak.findOne.mockResolvedValue({ value: 3 });
      mockUserAchievementEvent.create.mockResolvedValue();

      await achievementService.syncAchievementForUser({
        idUserProfile: 1,
        definition: mockDefinition,
        transaction: externalTransaction,
      });

      expect(externalTransaction.commit).not.toHaveBeenCalled();
      expect(externalTransaction.rollback).not.toHaveBeenCalled();
    });

    it('hace rollback en caso de error', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        metric_type: 'STREAK_DAYS',
        target_value: 7,
      };

      mockUserAchievement.findOrCreate.mockRejectedValue(new Error('DB Error'));

      await expect(
        achievementService.syncAchievementForUser({
          idUserProfile: 1,
          definition: mockDefinition,
        })
      ).rejects.toThrow('DB Error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    it('actualiza metadata si cambió', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        metric_type: 'BODY_WEIGHT_PROGRESS',
        target_value: 5,
        metadata: { direction: 'DECREASE' },
      };

      const mockUserAch = {
        progress_value: 2,
        progress_denominator: 5,
        unlocked: false,
        metadata: null,
        save: jest.fn().mockResolvedValue(),
      };

      mockUserAchievement.findOrCreate.mockResolvedValue([mockUserAch, false]);

      const mockProgress = require('../../../../models').Progress;
      mockProgress.findAll.mockResolvedValue([
        { body_weight: 80, date: '2025-01-01' },
        { body_weight: 78, date: '2025-01-15' },
      ]);

      mockUserAchievementEvent.create.mockResolvedValue();

      await achievementService.syncAchievementForUser({
        idUserProfile: 1,
        definition: mockDefinition,
      });

      expect(mockUserAch.metadata).toBeDefined();
      expect(mockUserAch.save).toHaveBeenCalled();
    });
  });

  describe('syncAllAchievementsForUser', () => {
    it('sincroniza todas las definiciones activas para el usuario', async () => {
      const mockDefinitions = [
        {
          id_achievement_definition: 1,
          code: 'STREAK_7',
          metric_type: 'STREAK_DAYS',
          target_value: 7,
        },
        {
          id_achievement_definition: 2,
          code: 'ASSIST_10',
          metric_type: 'ASSISTANCE_TOTAL',
          target_value: 10,
        },
      ];

      mockAchievementDefinition.findAll.mockResolvedValue(mockDefinitions);

      const mockUserAch1 = { progress_value: 0, save: jest.fn() };
      const mockUserAch2 = { progress_value: 0, save: jest.fn() };

      mockUserAchievement.findOrCreate
        .mockResolvedValueOnce([mockUserAch1, true])
        .mockResolvedValueOnce([mockUserAch2, true]);

      mockStreak.findOne.mockResolvedValue({ value: 3 });
      mockAssistance.count.mockResolvedValue(5);
      mockUserAchievementEvent.create.mockResolvedValue();

      const results = await achievementService.syncAllAchievementsForUser(1);

      expect(results).toHaveLength(2);
      expect(results[0].definition.code).toBe('STREAK_7');
      expect(results[1].definition.code).toBe('ASSIST_10');
      expect(mockTransaction.commit).toHaveBeenCalledTimes(2);
    });

    it('filtra por categoría específica', async () => {
      const mockDefinitions = [
        {
          id_achievement_definition: 1,
          category: 'STREAK',
          metric_type: 'STREAK_DAYS',
          target_value: 7,
        },
      ];

      mockAchievementDefinition.findAll.mockResolvedValue(mockDefinitions);
      mockUserAchievement.findOrCreate.mockResolvedValue([
        { progress_value: 0, save: jest.fn() },
        true,
      ]);
      mockStreak.findOne.mockResolvedValue({ value: 2 });
      mockUserAchievementEvent.create.mockResolvedValue();

      await achievementService.syncAllAchievementsForUser(1, { category: 'STREAK' });

      expect(mockAchievementDefinition.findAll).toHaveBeenCalledWith({
        where: { is_active: true, category: 'STREAK' },
        order: [['category', 'ASC'], ['target_value', 'ASC']],
      });
    });

    it('usa transaction externa si se provee', async () => {
      const externalTransaction = { ...mockTransaction };
      const mockDefinitions = [
        {
          id_achievement_definition: 1,
          metric_type: 'STREAK_DAYS',
          target_value: 7,
        },
      ];

      mockAchievementDefinition.findAll.mockResolvedValue(mockDefinitions);
      mockUserAchievement.findOrCreate.mockResolvedValue([
        { progress_value: 0, save: jest.fn() },
        true,
      ]);
      mockStreak.findOne.mockResolvedValue({ value: 2 });
      mockUserAchievementEvent.create.mockResolvedValue();

      await achievementService.syncAllAchievementsForUser(1, {
        transaction: externalTransaction,
      });

      expect(externalTransaction.commit).not.toHaveBeenCalled();
    });
  });
});
