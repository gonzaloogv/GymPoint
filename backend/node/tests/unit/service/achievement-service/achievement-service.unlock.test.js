/**
 * Tests para achievement-service - Unlock Method
 * Cubre: unlockAchievement
 */

const {
  mockSequelize,
  mockTransaction,
  mockAchievementDefinition,
  mockUserAchievement,
  mockUserAchievementEvent,
  mockStreak,
  mockAssistance,
  mockErrors,
  mockAchievementSideEffects,
  mockRewardService,
} = require('./test-setup');

const achievementService = require('../../../../services/achievement-service');

describe('achievement-service unlock method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
    mockTransaction.commit.mockResolvedValue();
    mockTransaction.rollback.mockResolvedValue();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  describe('unlockAchievement', () => {
    it('desbloquea un logro cuando el progreso es suficiente', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        code: 'STREAK_7',
        name: 'Racha de 7 días',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
        metadata: { token_reward: 50 },
        get: jest.fn().mockReturnThis(),
      };

      const mockUserAch = {
        id_user_achievement: 1,
        id_user_profile: 1,
        id_achievement_definition: 1,
        progress_value: 5,
        progress_denominator: 7,
        unlocked: false,
        unlocked_at: null,
        save: jest.fn().mockResolvedValue(),
      };

      mockAchievementDefinition.findByPk.mockResolvedValue(mockDefinition);
      mockUserAchievement.findOrCreate.mockResolvedValue([mockUserAch, false]);
      mockUserAchievement.findOne.mockResolvedValue(mockUserAch);
      mockStreak.findOne.mockResolvedValue({ value: 7, id_streak: 101 });
      mockUserAchievementEvent.create.mockResolvedValue();
      mockAchievementSideEffects.handleUnlock.mockResolvedValue();
      mockRewardService.getActiveMultiplier.mockResolvedValue(2);

      const result = await achievementService.unlockAchievement(1, 1);

      expect(mockUserAch.unlocked).toBe(true);
      expect(mockUserAch.unlocked_at).toBeInstanceOf(Date);
      expect(mockUserAch.progress_value).toBe(7);
      expect(mockUserAch.save).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockAchievementSideEffects.handleUnlock).toHaveBeenCalledWith({
        idUserProfile: 1,
        definition: mockDefinition,
        userAchievement: mockUserAch,
      });
      expect(result).toMatchObject({
        definition: mockDefinition,
        progress: {
          value: 7,
          denominator: 7,
          percentage: 1,
        },
        unlocked: true,
        earnedTokens: 100, // 50 * 2
        tokenReward: 50,
        multiplier: 2,
      });
    });

    it('lanza NotFoundError si la definición no existe', async () => {
      mockAchievementDefinition.findByPk.mockResolvedValue(null);

      await expect(achievementService.unlockAchievement(999, 1)).rejects.toThrow(
        mockErrors.NotFoundError
      );
      await expect(achievementService.unlockAchievement(999, 1)).rejects.toThrow(
        'Definición de logro no encontrada'
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('lanza NotFoundError si user_achievement no existe después del sync', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        code: 'STREAK_7',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
        get: jest.fn().mockReturnThis(),
      };

      mockAchievementDefinition.findByPk.mockResolvedValue(mockDefinition);

      // Simular que findOrCreate funciona pero luego findOne no encuentra nada
      const mockUserAch = {
        progress_value: 0,
        progress_denominator: 7,
        unlocked: false,
        save: jest.fn().mockResolvedValue(),
      };
      mockUserAchievement.findOrCreate.mockResolvedValue([mockUserAch, true]);
      mockUserAchievementEvent.create.mockResolvedValue();
      mockStreak.findOne.mockResolvedValue({ value: 0 });
      mockUserAchievement.findOne.mockResolvedValue(null); // Pero findOne retorna null

      await expect(achievementService.unlockAchievement(1, 1)).rejects.toThrow(
        mockErrors.NotFoundError
      );
      await expect(achievementService.unlockAchievement(1, 1)).rejects.toThrow(
        'Logro no encontrado o no pertenece al usuario'
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('lanza ConflictError si el logro ya está desbloqueado', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        code: 'STREAK_7',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
      };

      const mockUserAch = {
        id_user_achievement: 1,
        unlocked: true,
        progress_value: 7,
        progress_denominator: 7,
        save: jest.fn().mockResolvedValue(),
      };

      mockAchievementDefinition.findByPk.mockResolvedValue(mockDefinition);
      mockUserAchievement.findOrCreate.mockResolvedValue([mockUserAch, false]);
      mockUserAchievement.findOne.mockResolvedValue(mockUserAch);
      mockStreak.findOne.mockResolvedValue({ value: 7 });
      mockUserAchievementEvent.create.mockResolvedValue();

      await expect(achievementService.unlockAchievement(1, 1)).rejects.toThrow(
        mockErrors.ConflictError
      );
      await expect(achievementService.unlockAchievement(1, 1)).rejects.toThrow(
        'El logro ya está desbloqueado'
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('lanza ValidationError si el progreso es insuficiente', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        code: 'STREAK_7',
        name: 'Racha de 7 días',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
      };

      const mockUserAch = {
        id_user_achievement: 1,
        unlocked: false,
        progress_value: 3,
        progress_denominator: 7,
        save: jest.fn().mockResolvedValue(),
      };

      mockAchievementDefinition.findByPk.mockResolvedValue(mockDefinition);
      mockUserAchievement.findOrCreate.mockResolvedValue([mockUserAch, false]);
      mockUserAchievement.findOne.mockResolvedValue(mockUserAch);
      mockStreak.findOne.mockResolvedValue({ value: 3 });
      mockUserAchievementEvent.create.mockResolvedValue();

      await expect(achievementService.unlockAchievement(1, 1)).rejects.toThrow(
        mockErrors.ValidationError
      );
      await expect(achievementService.unlockAchievement(1, 1)).rejects.toThrow(
        'Progreso insuficiente para "Racha de 7 días" (STREAK_7). Necesitas alcanzar 7, tienes 3'
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('registra evento UNLOCKED correctamente', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        code: 'ASSIST_10',
        metric_type: 'ASSISTANCE_TOTAL',
        target_value: 10,
        metadata: { token_reward: 30 },
        get: jest.fn().mockReturnThis(),
      };

      const mockUserAch = {
        id_user_achievement: 1,
        unlocked: false,
        progress_value: 8,
        progress_denominator: 10,
        save: jest.fn().mockResolvedValue(),
      };

      mockAchievementDefinition.findByPk.mockResolvedValue(mockDefinition);
      mockUserAchievement.findOrCreate.mockResolvedValue([mockUserAch, false]);
      mockUserAchievement.findOne.mockResolvedValue(mockUserAch);
      mockAssistance.count.mockResolvedValue(10);
      mockUserAchievementEvent.create.mockResolvedValue();
      mockAchievementSideEffects.handleUnlock.mockResolvedValue();
      mockRewardService.getActiveMultiplier.mockResolvedValue(1);

      await achievementService.unlockAchievement(1, 1);

      expect(mockUserAchievementEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id_user_achievement: 1,
          event_type: 'UNLOCKED',
          delta: 0,
          snapshot_value: 10,
          source_type: 'manual_unlock',
          source_id: null,
          metadata: { unlockedManually: true },
        }),
        { transaction: mockTransaction }
      );
    });

    it('sincroniza el achievement antes de validar progreso', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        code: 'STREAK_7',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
        metadata: { token_reward: 50 },
        get: jest.fn().mockReturnThis(),
      };

      const mockUserAch = {
        id_user_achievement: 1,
        unlocked: false,
        progress_value: 5, // Valor guardado desactualizado
        progress_denominator: 7,
        save: jest.fn().mockResolvedValue(),
      };

      mockAchievementDefinition.findByPk.mockResolvedValue(mockDefinition);
      mockUserAchievement.findOrCreate.mockResolvedValue([mockUserAch, false]);
      mockUserAchievement.findOne.mockResolvedValue(mockUserAch);
      mockStreak.findOne.mockResolvedValue({ value: 7 }); // Progreso real es 7
      mockUserAchievementEvent.create.mockResolvedValue();
      mockAchievementSideEffects.handleUnlock.mockResolvedValue();
      mockRewardService.getActiveMultiplier.mockResolvedValue(1);

      const result = await achievementService.unlockAchievement(1, 1);

      expect(mockUserAch.progress_value).toBe(7); // Actualizado antes de desbloquear
      expect(result.progress.value).toBe(7);
      expect(result.unlocked).toBe(true);
    });

    it('calcula tokens correctamente sin multiplicador', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        code: 'STREAK_7',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
        metadata: { token_reward: 100 },
        get: jest.fn().mockReturnThis(),
      };

      const mockUserAch = {
        id_user_achievement: 1,
        unlocked: false,
        progress_value: 7,
        progress_denominator: 7,
        save: jest.fn().mockResolvedValue(),
      };

      mockAchievementDefinition.findByPk.mockResolvedValue(mockDefinition);
      mockUserAchievement.findOrCreate.mockResolvedValue([mockUserAch, false]);
      mockUserAchievement.findOne.mockResolvedValue(mockUserAch);
      mockStreak.findOne.mockResolvedValue({ value: 7 });
      mockUserAchievementEvent.create.mockResolvedValue();
      mockAchievementSideEffects.handleUnlock.mockResolvedValue();
      mockRewardService.getActiveMultiplier.mockResolvedValue(null);

      const result = await achievementService.unlockAchievement(1, 1);

      expect(result.earnedTokens).toBe(100);
      expect(result.multiplier).toBe(1);
    });

    it('hace rollback en caso de error durante unlock', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        code: 'STREAK_7',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
      };

      const mockUserAch = {
        unlocked: false,
        progress_value: 7,
        save: jest.fn().mockRejectedValue(new Error('DB Error')),
      };

      mockAchievementDefinition.findByPk.mockResolvedValue(mockDefinition);
      mockUserAchievement.findOrCreate.mockResolvedValue([mockUserAch, false]);
      mockUserAchievement.findOne.mockResolvedValue(mockUserAch);
      mockStreak.findOne.mockResolvedValue({ value: 7 });

      await expect(achievementService.unlockAchievement(1, 1)).rejects.toThrow('DB Error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    it('logs detallados durante el proceso de unlock', async () => {
      const mockDefinition = {
        id_achievement_definition: 1,
        code: 'STREAK_7',
        name: 'Racha de 7 días',
        category: 'STREAK',
        metric_type: 'STREAK_DAYS',
        target_value: 7,
        metadata: { token_reward: 50 },
        get: jest.fn().mockReturnThis(),
      };

      const mockUserAch = {
        id_user_achievement: 1,
        unlocked: false,
        progress_value: 7,
        progress_denominator: 7,
        save: jest.fn().mockResolvedValue(),
      };

      mockAchievementDefinition.findByPk.mockResolvedValue(mockDefinition);
      mockUserAchievement.findOrCreate.mockResolvedValue([mockUserAch, false]);
      mockUserAchievement.findOne.mockResolvedValue(mockUserAch);
      mockStreak.findOne.mockResolvedValue({ value: 7 });
      mockUserAchievementEvent.create.mockResolvedValue();
      mockAchievementSideEffects.handleUnlock.mockResolvedValue();
      mockRewardService.getActiveMultiplier.mockResolvedValue(1);

      await achievementService.unlockAchievement(1, 1);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[unlockAchievement] INICIO DEL PROCESO')
      );
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('User ID: 1'));
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[unlockAchievement] Logro desbloqueado exitosamente')
      );
    });
  });
});
