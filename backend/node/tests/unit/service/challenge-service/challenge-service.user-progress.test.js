/**
 * Tests para challenge-service - User Progress
 * Cubre: startChallenge, updateChallengeProgress, claimChallengeReward, getUserChallengeProgress, listUserChallenges
 */

const {
  mockDailyChallengeRepository,
  mockTokenLedgerService,
  mockRewardService,
  mockAchievementService,
  mockProcessUnlockResults,
  mockErrors,
  challengeService,
} = require('./test-setup');

describe('challenge-service user progress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('startChallenge', () => {
    it('inicia challenge para usuario', async () => {
      const command = {
        idUserProfile: 10,
        idChallenge: 1,
      };

      mockDailyChallengeRepository.findById.mockResolvedValue({
        id_challenge: 1,
        title: 'Challenge Test',
      });
      mockDailyChallengeRepository.findUserProgress.mockResolvedValue(null);
      mockDailyChallengeRepository.createUserProgress.mockResolvedValue({
        id_user_challenge: 1,
        id_user_profile: 10,
        id_challenge: 1,
        progress: 0,
        completed: false,
      });

      const result = await challengeService.startChallenge(command);

      expect(mockDailyChallengeRepository.findById).toHaveBeenCalledWith(1);
      expect(mockDailyChallengeRepository.findUserProgress).toHaveBeenCalledWith(10, 1);
      expect(mockDailyChallengeRepository.createUserProgress).toHaveBeenCalledWith({
        id_user_profile: 10,
        id_challenge: 1,
        progress: 0,
        completed: false,
      });

      expect(result.id_user_challenge).toBe(1);
    });

    it('retorna progreso existente si ya fue iniciado', async () => {
      const command = {
        idUserProfile: 10,
        idChallenge: 1,
      };

      const existingProgress = {
        id_user_challenge: 1,
        id_user_profile: 10,
        id_challenge: 1,
        progress: 15,
        completed: false,
      };

      mockDailyChallengeRepository.findById.mockResolvedValue({ id_challenge: 1 });
      mockDailyChallengeRepository.findUserProgress.mockResolvedValue(existingProgress);

      const result = await challengeService.startChallenge(command);

      expect(result).toEqual(existingProgress);
      expect(mockDailyChallengeRepository.createUserProgress).not.toHaveBeenCalled();
    });

    it('lanza NotFoundError si challenge no existe', async () => {
      const command = {
        idUserProfile: 10,
        idChallenge: 999,
      };

      mockDailyChallengeRepository.findById.mockResolvedValue(null);

      await expect(challengeService.startChallenge(command)).rejects.toThrow(
        mockErrors.NotFoundError
      );
      await expect(challengeService.startChallenge(command)).rejects.toThrow('Desafío');
    });
  });

  describe('updateChallengeProgress', () => {
    it('actualiza progreso de challenge existente', async () => {
      const command = {
        idUserProfile: 10,
        idChallenge: 1,
        currentValue: 20,
      };

      mockDailyChallengeRepository.findById.mockResolvedValue({
        id_challenge: 1,
        target_value: 30,
      });
      mockDailyChallengeRepository.findUserProgress.mockResolvedValue({
        id_user_challenge: 1,
        id_user_profile: 10,
        id_challenge: 1,
        current_value: 10,
        status: 'IN_PROGRESS',
      });
      mockDailyChallengeRepository.updateUserProgress.mockResolvedValue({
        id_user_challenge: 1,
        current_value: 20,
        status: 'IN_PROGRESS',
      });

      const result = await challengeService.updateChallengeProgress(command);

      expect(mockDailyChallengeRepository.updateUserProgress).toHaveBeenCalledWith(10, 1, {
        progress: 20,
      });

      expect(result.current_value).toBe(20);
    });

    it('marca como completado cuando alcanza target_value', async () => {
      const command = {
        idUserProfile: 10,
        idChallenge: 1,
        currentValue: 30,
      };

      mockDailyChallengeRepository.findById.mockResolvedValue({
        id_challenge: 1,
        target_value: 30,
      });
      mockDailyChallengeRepository.findUserProgress.mockResolvedValue({
        id_user_challenge: 1,
        status: 'IN_PROGRESS',
      });
      mockDailyChallengeRepository.updateUserProgress.mockResolvedValue({
        id_user_challenge: 1,
        current_value: 30,
        status: 'COMPLETED',
      });

      await challengeService.updateChallengeProgress(command);

      expect(mockDailyChallengeRepository.updateUserProgress).toHaveBeenCalledWith(
        10,
        1,
        expect.objectContaining({
          progress: 30,
          completed: true,
          completed_at: expect.any(Date),
        })
      );
    });

    it('no marca como completado si ya estaba completado', async () => {
      const command = {
        idUserProfile: 10,
        idChallenge: 1,
        currentValue: 35,
      };

      mockDailyChallengeRepository.findById.mockResolvedValue({
        id_challenge: 1,
        target_value: 30,
      });
      mockDailyChallengeRepository.findUserProgress.mockResolvedValue({
        id_user_challenge: 1,
        status: 'COMPLETED',
      });
      mockDailyChallengeRepository.updateUserProgress.mockResolvedValue({
        id_user_challenge: 1,
      });

      await challengeService.updateChallengeProgress(command);

      expect(mockDailyChallengeRepository.updateUserProgress).toHaveBeenCalledWith(10, 1, {
        progress: 35,
      });
    });

    it('auto-inicia challenge si no existe progreso', async () => {
      const command = {
        idUserProfile: 10,
        idChallenge: 1,
        currentValue: 10,
      };

      mockDailyChallengeRepository.findById.mockResolvedValue({
        id_challenge: 1,
        target_value: 30,
      });
      mockDailyChallengeRepository.findUserProgress
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockDailyChallengeRepository.createUserProgress.mockResolvedValue({
        id_user_challenge: 1,
        id_user_profile: 10,
        id_challenge: 1,
        progress: 0,
        completed: false,
      });
      mockDailyChallengeRepository.updateUserProgress.mockResolvedValue({
        current_value: 10,
      });

      await challengeService.updateChallengeProgress(command);

      expect(mockDailyChallengeRepository.createUserProgress).toHaveBeenCalled();
      expect(mockDailyChallengeRepository.updateUserProgress).toHaveBeenCalledWith(
        10,
        1,
        expect.objectContaining({ progress: 10 })
      );
    });

    it('lanza NotFoundError si challenge no existe', async () => {
      const command = {
        idUserProfile: 10,
        idChallenge: 999,
        currentValue: 10,
      };

      mockDailyChallengeRepository.findById.mockResolvedValue(null);

      await expect(challengeService.updateChallengeProgress(command)).rejects.toThrow(
        mockErrors.NotFoundError
      );
    });
  });

  describe('claimChallengeReward', () => {
    it('reclama recompensa exitosamente', async () => {
      const command = {
        idUserProfile: 10,
        idChallenge: 1,
      };

      mockDailyChallengeRepository.findUserProgress.mockResolvedValue({
        id_user_challenge: 1,
        status: 'COMPLETED',
        tokens_earned: 0,
      });
      mockDailyChallengeRepository.findById.mockResolvedValue({
        id_challenge: 1,
        tokens_reward: 20,
      });
      mockRewardService.getActiveMultiplier.mockResolvedValue(1.5);
      mockTokenLedgerService.registrarMovimiento.mockResolvedValue({
        newBalance: 130,
      });
      mockDailyChallengeRepository.updateUserProgress.mockResolvedValue({
        tokens_earned: 20,
      });
      mockAchievementService.syncAllAchievementsForUser.mockResolvedValue([]);
      mockProcessUnlockResults.mockResolvedValue(undefined);

      const result = await challengeService.claimChallengeReward(command);

      expect(mockRewardService.getActiveMultiplier).toHaveBeenCalledWith(10);
      expect(mockTokenLedgerService.registrarMovimiento).toHaveBeenCalledWith({
        userId: 10,
        delta: 30, // 20 * 1.5
        reason: 'DAILY_CHALLENGE_COMPLETED',
        refType: 'challenge',
        refId: 1,
      });
      expect(mockDailyChallengeRepository.updateUserProgress).toHaveBeenCalledWith(10, 1, {
        tokens_earned: 20,
      });
      expect(mockAchievementService.syncAllAchievementsForUser).toHaveBeenCalledWith(10, {
        categories: ['CHALLENGE', 'TOKEN'],
      });

      expect(result).toEqual({
        message: 'Recompensa reclamada exitosamente',
        tokens_awarded: 20,
      });
    });

    it('aplica multiplicador correctamente', async () => {
      const command = {
        idUserProfile: 10,
        idChallenge: 1,
      };

      mockDailyChallengeRepository.findUserProgress.mockResolvedValue({
        status: 'COMPLETED',
        tokens_earned: 0,
      });
      mockDailyChallengeRepository.findById.mockResolvedValue({
        tokens_reward: 10,
      });
      mockRewardService.getActiveMultiplier.mockResolvedValue(2);
      mockTokenLedgerService.registrarMovimiento.mockResolvedValue({});
      mockDailyChallengeRepository.updateUserProgress.mockResolvedValue({});
      mockAchievementService.syncAllAchievementsForUser.mockResolvedValue([]);

      await challengeService.claimChallengeReward(command);

      expect(mockTokenLedgerService.registrarMovimiento).toHaveBeenCalledWith(
        expect.objectContaining({
          delta: 20, // 10 * 2
        })
      );
    });

    it('lanza NotFoundError si no existe progreso', async () => {
      const command = {
        idUserProfile: 10,
        idChallenge: 1,
      };

      mockDailyChallengeRepository.findUserProgress.mockResolvedValue(null);

      await expect(challengeService.claimChallengeReward(command)).rejects.toThrow(
        mockErrors.NotFoundError
      );
      await expect(challengeService.claimChallengeReward(command)).rejects.toThrow(
        'Progreso de desafío'
      );
    });

    it('lanza BusinessError si challenge no está completado', async () => {
      const command = {
        idUserProfile: 10,
        idChallenge: 1,
      };

      mockDailyChallengeRepository.findUserProgress.mockResolvedValue({
        status: 'IN_PROGRESS',
        tokens_earned: 0,
      });

      await expect(challengeService.claimChallengeReward(command)).rejects.toThrow(
        mockErrors.BusinessError
      );
      await expect(challengeService.claimChallengeReward(command)).rejects.toThrow(
        'El desafío no está completado'
      );
    });

    it('lanza BusinessError si recompensa ya fue reclamada', async () => {
      const command = {
        idUserProfile: 10,
        idChallenge: 1,
      };

      mockDailyChallengeRepository.findUserProgress.mockResolvedValue({
        status: 'COMPLETED',
        tokens_earned: 20,
      });

      await expect(challengeService.claimChallengeReward(command)).rejects.toThrow(
        mockErrors.BusinessError
      );
      await expect(challengeService.claimChallengeReward(command)).rejects.toThrow(
        'La recompensa ya fue reclamada'
      );
    });

    it('continúa si falla sincronización de logros', async () => {
      const command = {
        idUserProfile: 10,
        idChallenge: 1,
      };

      mockDailyChallengeRepository.findUserProgress.mockResolvedValue({
        status: 'COMPLETED',
        tokens_earned: 0,
      });
      mockDailyChallengeRepository.findById.mockResolvedValue({
        tokens_reward: 20,
      });
      mockRewardService.getActiveMultiplier.mockResolvedValue(1);
      mockTokenLedgerService.registrarMovimiento.mockResolvedValue({});
      mockDailyChallengeRepository.updateUserProgress.mockResolvedValue({});
      mockAchievementService.syncAllAchievementsForUser.mockRejectedValue(
        new Error('Achievement sync error')
      );

      const result = await challengeService.claimChallengeReward(command);

      expect(console.error).toHaveBeenCalledWith(
        '[challenge-service] Error sincronizando logros',
        expect.any(Error)
      );
      expect(result.message).toBe('Recompensa reclamada exitosamente');
    });
  });

  describe('getUserChallengeProgress', () => {
    it('obtiene progreso de usuario', async () => {
      const query = {
        idUserProfile: 10,
        idChallenge: 1,
      };

      const mockProgress = {
        id_user_challenge: 1,
        id_user_profile: 10,
        id_challenge: 1,
        current_value: 20,
        status: 'IN_PROGRESS',
      };

      mockDailyChallengeRepository.findUserProgress.mockResolvedValue(mockProgress);

      const result = await challengeService.getUserChallengeProgress(query);

      expect(mockDailyChallengeRepository.findUserProgress).toHaveBeenCalledWith(10, 1);
      expect(result).toEqual(mockProgress);
    });

    it('retorna null si no existe progreso', async () => {
      mockDailyChallengeRepository.findUserProgress.mockResolvedValue(null);

      const result = await challengeService.getUserChallengeProgress({
        idUserProfile: 10,
        idChallenge: 1,
      });

      expect(result).toBeNull();
    });
  });

  describe('listUserChallenges', () => {
    it('lista challenges de usuario con valores por defecto', async () => {
      const mockChallenges = [
        { id_user_challenge: 1, status: 'COMPLETED' },
        { id_user_challenge: 2, status: 'IN_PROGRESS' },
      ];

      mockDailyChallengeRepository.listUserChallenges.mockResolvedValue({
        rows: mockChallenges,
        count: 2,
      });

      const result = await challengeService.listUserChallenges({ idUserProfile: 10 });

      expect(mockDailyChallengeRepository.listUserChallenges).toHaveBeenCalledWith({
        idUserProfile: 10,
        filters: { status: null },
        pagination: {
          limit: 20,
          offset: 0,
        },
      });

      expect(result).toEqual({
        items: mockChallenges,
        total: 2,
        page: 1,
        limit: 20,
      });
    });

    it('aplica filtros y paginación', async () => {
      mockDailyChallengeRepository.listUserChallenges.mockResolvedValue({
        rows: [],
        count: 0,
      });

      await challengeService.listUserChallenges({
        idUserProfile: 10,
        status: 'COMPLETED',
        page: 2,
        limit: 10,
      });

      expect(mockDailyChallengeRepository.listUserChallenges).toHaveBeenCalledWith({
        idUserProfile: 10,
        filters: { status: 'COMPLETED' },
        pagination: {
          limit: 10,
          offset: 10,
        },
      });
    });
  });
});
