jest.mock('../infra/db/repositories', () => ({
  streakRepository: {
    findById: jest.fn(),
    findByUserProfileId: jest.fn(),
    updateStreak: jest.fn(),
    getStreakStats: jest.fn(),
    listTopStreaks: jest.fn(),
    createStreak: jest.fn()
  }
}));

jest.mock('../utils/errors', () => ({
  NotFoundError: class NotFoundError extends Error {
    constructor(msg) {
      super(msg);
      this.name = 'NotFoundError';
    }
  },
  BusinessError: class BusinessError extends Error {
    constructor(msg, code) {
      super(msg);
      this.name = 'BusinessError';
      this.code = code;
    }
  }
}));

const streakService = require('../services/streak-service');
const { streakRepository } = require('../infra/db/repositories');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Streak Service', () => {
  describe('getUserStreak', () => {
    it('should return user streak with relations', async () => {
      const mockStreak = {
        id_streak: 1,
        id_user_profile: 1,
        value: 15,
        last_value: 10,
        max_value: 20,
        recovery_items: 2,
        userProfile: {
          id_user_profile: 1,
          name: 'John',
          lastname: 'Doe'
        },
        frequency: {
          goal: 3,
          assist: 2,
          achieved_goal: false
        }
      };

      streakRepository.findByUserProfileId.mockResolvedValue(mockStreak);

      const result = await streakService.getUserStreak({ idUserProfile: 1 });

      expect(result).toEqual(mockStreak);
      expect(streakRepository.findByUserProfileId).toHaveBeenCalledWith(
        1,
        { includeRelations: true }
      );
    });

    it('should throw NotFoundError if streak not found', async () => {
      streakRepository.findByUserProfileId.mockResolvedValue(null);

      await expect(streakService.getUserStreak(1))
        .rejects.toThrow('Racha del usuario');
    });

    it('should accept plain number as parameter', async () => {
      const mockStreak = {
        id_streak: 1,
        value: 10
      };

      streakRepository.findByUserProfileId.mockResolvedValue(mockStreak);

      const result = await streakService.getUserStreak(1);

      expect(result).toEqual(mockStreak);
    });
  });

  describe('getStreakById', () => {
    it('should return streak by ID', async () => {
      const mockStreak = {
        id_streak: 1,
        value: 15
      };

      streakRepository.findById.mockResolvedValue(mockStreak);

      const result = await streakService.getStreakById({ idStreak: 1 });

      expect(result).toEqual(mockStreak);
      expect(streakRepository.findById).toHaveBeenCalledWith(
        1,
        { includeRelations: true }
      );
    });

    it('should throw NotFoundError if not found', async () => {
      streakRepository.findById.mockResolvedValue(null);

      await expect(streakService.getStreakById(1))
        .rejects.toThrow('Racha');
    });
  });

  describe('getStreakStats', () => {
    it('should return global streak statistics', async () => {
      const mockStats = {
        totalStreaks: 100,
        averageStreak: 15,
        maxStreak: 365
      };

      streakRepository.getStreakStats.mockResolvedValue(mockStats);

      const result = await streakService.getStreakStats();

      expect(result).toEqual(mockStats);
    });
  });

  describe('listTopStreaks', () => {
    it('should list top streaks with default limit', async () => {
      const mockStreaks = [
        { id_streak: 1, value: 100 },
        { id_streak: 2, value: 90 }
      ];

      streakRepository.listTopStreaks.mockResolvedValue(mockStreaks);

      const result = await streakService.listTopStreaks();

      expect(result).toEqual(mockStreaks);
      expect(streakRepository.listTopStreaks).toHaveBeenCalledWith(10);
    });

    it('should list top streaks with custom limit', async () => {
      const mockStreaks = [
        { id_streak: 1, value: 100 }
      ];

      streakRepository.listTopStreaks.mockResolvedValue(mockStreaks);

      const result = await streakService.listTopStreaks({ limit: 5 });

      expect(result).toEqual(mockStreaks);
      expect(streakRepository.listTopStreaks).toHaveBeenCalledWith(5);
    });
  });

  describe('useRecoveryItem', () => {
    it('should use a recovery item successfully', async () => {
      const mockStreak = {
        id_streak: 1,
        value: 15,
        recovery_items: 3
      };

      const updatedStreak = {
        ...mockStreak,
        recovery_items: 2
      };

      streakRepository.findByUserProfileId.mockResolvedValue(mockStreak);
      streakRepository.updateStreak.mockResolvedValue(updatedStreak);

      const result = await streakService.useRecoveryItem({ idUserProfile: 1 });

      expect(result.message).toContain('exitosamente');
      expect(result.recovery_items_remaining).toBe(2);
      expect(result.streak_value).toBe(15);
      expect(streakRepository.updateStreak).toHaveBeenCalledWith(
        1,
        { recovery_items: 2 }
      );
    });

    it('should throw error if no recovery items available', async () => {
      const mockStreak = {
        id_streak: 1,
        recovery_items: 0
      };

      streakRepository.findByUserProfileId.mockResolvedValue(mockStreak);

      await expect(streakService.useRecoveryItem({ idUserProfile: 1 }))
        .rejects.toThrow('No tienes items de recuperación disponibles');
    });

    it('should throw error if streak not found', async () => {
      streakRepository.findByUserProfileId.mockResolvedValue(null);

      await expect(streakService.useRecoveryItem({ idUserProfile: 1 }))
        .rejects.toThrow('Racha del usuario');
    });
  });

  describe('updateStreak', () => {
    it('should increment streak when continued', async () => {
      const mockStreak = {
        id_streak: 1,
        value: 10,
        max_value: 15,
        recovery_items: 2
      };

      const updatedStreak = {
        ...mockStreak,
        value: 11,
        last_assistance_date: expect.any(Date)
      };

      streakRepository.findById.mockResolvedValue(mockStreak);
      streakRepository.updateStreak.mockResolvedValue(updatedStreak);

      const result = await streakService.updateStreak({
        idStreak: 1,
        continuaRacha: true
      });

      expect(streakRepository.updateStreak).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          value: 11,
          last_assistance_date: expect.any(Date)
        })
      );
    });

    it('should update max_value if exceeded', async () => {
      const mockStreak = {
        id_streak: 1,
        value: 20,
        max_value: 20,
        recovery_items: 2
      };

      streakRepository.findById.mockResolvedValue(mockStreak);
      streakRepository.updateStreak.mockResolvedValue({});

      await streakService.updateStreak({
        idStreak: 1,
        continuaRacha: true
      });

      expect(streakRepository.updateStreak).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          value: 21,
          max_value: 21
        })
      );
    });

    it('should use recovery item automatically when streak breaks', async () => {
      const mockStreak = {
        id_streak: 1,
        value: 10,
        recovery_items: 2
      };

      streakRepository.findById.mockResolvedValue(mockStreak);
      streakRepository.updateStreak.mockResolvedValue({});

      await streakService.updateStreak({
        idStreak: 1,
        continuaRacha: false
      });

      expect(streakRepository.updateStreak).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          recovery_items: 1
        })
      );
    });

    it('should reset streak when broken without recovery items', async () => {
      const mockStreak = {
        id_streak: 1,
        value: 10,
        recovery_items: 0
      };

      streakRepository.findById.mockResolvedValue(mockStreak);
      streakRepository.updateStreak.mockResolvedValue({});

      await streakService.updateStreak({
        idStreak: 1,
        continuaRacha: false
      });

      expect(streakRepository.updateStreak).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          last_value: 10,
          value: 1
        })
      );
    });
  });

  describe('resetStreak', () => {
    it('should reset user streak to zero', async () => {
      const mockStreak = {
        id_streak: 1,
        id_user_profile: 1,
        value: 25
      };

      const updatedStreak = {
        ...mockStreak,
        value: 0,
        last_value: 25
      };

      streakRepository.findByUserProfileId.mockResolvedValue(mockStreak);
      streakRepository.updateStreak.mockResolvedValue(updatedStreak);

      const result = await streakService.resetStreak({ idUserProfile: 1 });

      expect(result.value).toBe(0);
      expect(result.last_value).toBe(25);
      expect(streakRepository.updateStreak).toHaveBeenCalledWith(
        1,
        { last_value: 25, value: 0 }
      );
    });

    it('should throw error if streak not found', async () => {
      streakRepository.findByUserProfileId.mockResolvedValue(null);

      await expect(streakService.resetStreak({ idUserProfile: 1 }))
        .rejects.toThrow('Racha del usuario');
    });
  });

  describe('grantRecoveryItems', () => {
    it('should grant recovery items to user', async () => {
      const mockStreak = {
        id_streak: 1,
        recovery_items: 2
      };

      const updatedStreak = {
        ...mockStreak,
        recovery_items: 5
      };

      streakRepository.findByUserProfileId.mockResolvedValue(mockStreak);
      streakRepository.updateStreak.mockResolvedValue(updatedStreak);

      const result = await streakService.grantRecoveryItems({
        idUserProfile: 1,
        cantidad: 3
      });

      expect(result.recovery_items).toBe(5);
      expect(streakRepository.updateStreak).toHaveBeenCalledWith(
        1,
        { recovery_items: 5 }
      );
    });

    it('should use amount field if cantidad not provided', async () => {
      const mockStreak = {
        id_streak: 1,
        recovery_items: 2
      };

      streakRepository.findByUserProfileId.mockResolvedValue(mockStreak);
      streakRepository.updateStreak.mockResolvedValue(mockStreak);

      await streakService.grantRecoveryItems({
        idUserProfile: 1,
        amount: 3
      });

      expect(streakRepository.updateStreak).toHaveBeenCalledWith(
        1,
        { recovery_items: 5 }
      );
    });
  });

  describe('createStreak', () => {
    it('should create a new streak for user', async () => {
      const mockStreak = {
        id_streak: 1,
        id_user_profile: 1,
        value: 0,
        last_value: 0,
        max_value: 0,
        recovery_items: 0
      };

      streakRepository.createStreak.mockResolvedValue(mockStreak);

      const result = await streakService.createStreak({
        idUserProfile: 1,
        idFrequency: 1
      });

      expect(result).toEqual(mockStreak);
      expect(streakRepository.createStreak).toHaveBeenCalledWith(
        expect.objectContaining({
          id_user_profile: 1,
          value: 0,
          last_value: 0,
          max_value: 0,
          recovery_items: 0,
          id_frequency: 1
        }),
        expect.any(Object)
      );
    });
  });

  describe('Legacy aliases', () => {
    it('obtenerRachaUsuario should work', async () => {
      const mockStreak = { id_streak: 1, value: 10 };
      streakRepository.findByUserProfileId.mockResolvedValue(mockStreak);

      const result = await streakService.obtenerRachaUsuario(1);

      expect(result).toEqual(mockStreak);
    });

    it('usarItemRecuperacion should work', async () => {
      const mockStreak = { id_streak: 1, recovery_items: 2 };
      streakRepository.findByUserProfileId.mockResolvedValue(mockStreak);
      streakRepository.updateStreak.mockResolvedValue({ ...mockStreak, recovery_items: 1 });

      const result = await streakService.usarItemRecuperacion(1);

      expect(result.recovery_items_remaining).toBe(1);
    });

    it('actualizarRacha should work with legacy signature', async () => {
      const mockStreak = { id_streak: 1, value: 10, recovery_items: 0 };
      streakRepository.findById.mockResolvedValue(mockStreak);
      streakRepository.updateStreak.mockResolvedValue({});

      await streakService.actualizarRacha(1, true);

      expect(streakRepository.updateStreak).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ value: 11 })
      );
    });
  });
});
