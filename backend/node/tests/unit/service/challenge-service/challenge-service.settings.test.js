/**
 * Tests para challenge-service - Settings y Legacy Methods
 * Cubre: getChallengeSettings, updateChallengeSettings, getSettings (legacy), getActiveTemplates (legacy), updateProgress (legacy)
 */

const {
  mockDailyChallengeRepository,
  mockTokenLedgerService,
  mockRewardService,
  mockAchievementService,
  mockErrors,
  challengeService,
} = require('./test-setup');

describe('challenge-service settings and legacy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getChallengeSettings', () => {
    it('obtiene configuración de challenges', async () => {
      const mockSettings = {
        auto_rotation_enabled: true,
        default_tokens_reward: 10,
        rotation_time: '00:00',
      };

      mockDailyChallengeRepository.getSettings.mockResolvedValue(mockSettings);

      const result = await challengeService.getChallengeSettings();

      expect(mockDailyChallengeRepository.getSettings).toHaveBeenCalled();
      expect(result).toEqual(mockSettings);
    });

    it('retorna null si no hay configuración', async () => {
      mockDailyChallengeRepository.getSettings.mockResolvedValue(null);

      const result = await challengeService.getChallengeSettings();

      expect(result).toBeNull();
    });
  });

  describe('updateChallengeSettings', () => {
    it('actualiza configuración exitosamente', async () => {
      const command = {
        enabledDays: [1, 2, 3, 4, 5],
        autoGenerate: true,
        autoGenerateTime: '06:00',
        defaultTokensReward: 15,
      };

      mockDailyChallengeRepository.updateSettings.mockResolvedValue({
        enabled_days: [1, 2, 3, 4, 5],
        auto_generate: true,
        auto_generate_time: '06:00',
        default_tokens_reward: 15,
      });

      const result = await challengeService.updateChallengeSettings(command);

      expect(mockDailyChallengeRepository.updateSettings).toHaveBeenCalledWith({
        enabled_days: [1, 2, 3, 4, 5],
        auto_generate: true,
        auto_generate_time: '06:00',
        default_tokens_reward: 15,
      });

      expect(result.auto_generate).toBe(true);
      expect(result.default_tokens_reward).toBe(15);
    });

    it('actualiza solo campos especificados', async () => {
      const command = {
        defaultTokensReward: 25,
      };

      mockDailyChallengeRepository.updateSettings.mockResolvedValue({
        default_tokens_reward: 25,
      });

      await challengeService.updateChallengeSettings(command);

      expect(mockDailyChallengeRepository.updateSettings).toHaveBeenCalledWith({
        default_tokens_reward: 25,
      });
    });

    it('permite actualizar todos los campos', async () => {
      const command = {
        enabledDays: [0, 1, 2, 3, 4, 5, 6],
        autoGenerate: true,
        autoGenerateTime: '00:00',
        defaultTokensReward: 20,
      };

      mockDailyChallengeRepository.updateSettings.mockResolvedValue({});

      await challengeService.updateChallengeSettings(command);

      expect(mockDailyChallengeRepository.updateSettings).toHaveBeenCalledWith({
        enabled_days: [0, 1, 2, 3, 4, 5, 6],
        auto_generate: true,
        auto_generate_time: '00:00',
        default_tokens_reward: 20,
      });
    });
  });

  describe('getSettings (legacy)', () => {
    it('obtiene settings usando método legacy', async () => {
      const mockSettings = {
        auto_rotation_enabled: true,
        default_tokens_reward: 10,
      };

      mockDailyChallengeRepository.getSettings.mockResolvedValue(mockSettings);

      const result = await challengeService.getSettings();

      expect(mockDailyChallengeRepository.getSettings).toHaveBeenCalled();
      expect(result).toEqual(mockSettings);
    });

    it('retorna null si no hay settings', async () => {
      mockDailyChallengeRepository.getSettings.mockResolvedValue(null);

      const result = await challengeService.getSettings();

      expect(result).toBeNull();
    });
  });

  describe('getActiveTemplates (legacy)', () => {
    it('obtiene templates activos', async () => {
      const mockTemplates = [
        { id_template: 1, title: 'Template 1', is_active: true },
        { id_template: 2, title: 'Template 2', is_active: true },
      ];

      mockDailyChallengeRepository.listTemplates.mockResolvedValue({
        rows: mockTemplates,
        count: 2,
      });

      const result = await challengeService.getActiveTemplates();

      expect(mockDailyChallengeRepository.listTemplates).toHaveBeenCalledWith({
        filters: {
          isActive: true,
        },
        pagination: {
          limit: 20,
          offset: 0,
        },
      });

      expect(result).toEqual({
        items: mockTemplates,
        total: 2,
        page: 1,
        limit: 20,
      });
    });

    it('retorna paginación vacía si no hay templates activos', async () => {
      mockDailyChallengeRepository.listTemplates.mockResolvedValue({
        rows: [],
        count: 0,
      });

      const result = await challengeService.getActiveTemplates();

      expect(result).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
      });
    });
  });

  describe('updateProgress (legacy)', () => {
    beforeEach(() => {
      // Mock de fecha para tests de "today"
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-20T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('actualiza progreso y retorna resultado', async () => {
      const today = '2025-01-20';

      mockDailyChallengeRepository.findById.mockResolvedValue({
        id_challenge: 1,
        challenge_date: today,
        target_value: 30,
        is_active: true,
      });
      mockDailyChallengeRepository.findUserProgress.mockResolvedValue({
        id_user_challenge: 1,
        current_value: 0,
        status: 'IN_PROGRESS',
      });
      mockDailyChallengeRepository.updateUserProgress.mockResolvedValue({
        current_value: 20,
        status: 'IN_PROGRESS',
        tokens_earned: 0,
      });

      const result = await challengeService.updateProgress(10, 1, 20);

      expect(result).toEqual({
        progress: 20,
        completed: false,
        tokens_earned: 0,
      });
    });

    it('marca como completado y reclama recompensa automáticamente', async () => {
      const today = '2025-01-20';

      mockDailyChallengeRepository.findById.mockResolvedValue({
        id_challenge: 1,
        challenge_date: today,
        target_value: 30,
        tokens_reward: 20,
        is_active: true,
      });
      mockDailyChallengeRepository.findUserProgress
        .mockResolvedValueOnce({
          id_user_challenge: 1,
          current_value: 0,
          status: 'IN_PROGRESS',
        })
        .mockResolvedValueOnce({
          id_user_challenge: 1,
          status: 'COMPLETED',
          tokens_earned: 0,
        });
      mockDailyChallengeRepository.updateUserProgress.mockResolvedValue({
        current_value: 30,
        status: 'COMPLETED',
        tokens_earned: 0,
      });
      mockRewardService.getActiveMultiplier.mockResolvedValue(1);
      mockTokenLedgerService.registrarMovimiento.mockResolvedValue({});
      mockAchievementService.syncAllAchievementsForUser.mockResolvedValue([]);

      const result = await challengeService.updateProgress(10, 1, 30);

      expect(result).toEqual({
        progress: 30,
        completed: true,
        tokens_earned: 20,
      });
    });

    it('limita el valor al target_value máximo', async () => {
      const today = '2025-01-20';

      mockDailyChallengeRepository.findById.mockResolvedValue({
        id_challenge: 1,
        challenge_date: today,
        target_value: 30,
        is_active: true,
      });
      mockDailyChallengeRepository.findUserProgress.mockResolvedValue({
        current_value: 0,
        status: 'IN_PROGRESS',
      });
      mockDailyChallengeRepository.updateUserProgress.mockResolvedValue({
        current_value: 30,
        status: 'IN_PROGRESS',
        tokens_earned: 0,
      });

      await challengeService.updateProgress(10, 1, 50);

      expect(mockDailyChallengeRepository.updateUserProgress).toHaveBeenCalledWith(
        10,
        1,
        expect.objectContaining({
          progress: 30, // Limitado a target_value
        })
      );
    });

    it('lanza NotFoundError si challenge no existe', async () => {
      mockDailyChallengeRepository.findById.mockResolvedValue(null);

      await expect(challengeService.updateProgress(10, 999, 20)).rejects.toThrow(
        mockErrors.NotFoundError
      );
    });

    it('lanza BusinessError si challenge no está activo', async () => {
      mockDailyChallengeRepository.findById.mockResolvedValue({
        id_challenge: 1,
        is_active: false,
      });

      await expect(challengeService.updateProgress(10, 1, 20)).rejects.toThrow(
        mockErrors.BusinessError
      );
    });

    it('lanza BusinessError si challenge no es de hoy', async () => {
      mockDailyChallengeRepository.findById.mockResolvedValue({
        id_challenge: 1,
        challenge_date: '2025-01-19', // Ayer
        is_active: true,
      });

      await expect(challengeService.updateProgress(10, 1, 20)).rejects.toThrow(
        mockErrors.BusinessError
      );
    });
  });
});
