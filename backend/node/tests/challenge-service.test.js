jest.mock('../infra/db/repositories', () => ({
  dailyChallengeRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    findByDate: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    findUserProgress: jest.fn(),
    createUserProgress: jest.fn(),
    updateUserProgress: jest.fn(),
    listUserChallenges: jest.fn(),
    createTemplate: jest.fn(),
    findTemplateById: jest.fn(),
    listTemplates: jest.fn(),
    updateTemplate: jest.fn(),
    getSettings: jest.fn(),
    updateSettings: jest.fn()
  }
}));

jest.mock('../services/token-ledger-service', () => ({
  registrarMovimiento: jest.fn()
}));

jest.mock('../services/achievement-service', () => ({
  syncAllAchievementsForUser: jest.fn()
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

const challengeService = require('../services/challenge-service');
const { dailyChallengeRepository } = require('../infra/db/repositories');
const tokenLedgerService = require('../services/token-ledger-service');
const achievementService = require('../services/achievement-service');

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-01-15T10:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Challenge Service', () => {
  describe('getTodayChallenge', () => {
    it('should return today\'s challenge with user progress', async () => {
      const mockChallenge = {
        id_challenge: 1,
        challenge_date: '2025-01-15',
        title: 'Walk 10,000 steps',
        target_value: 10000
      };
      const mockProgress = {
        id_user_challenge: 1,
        current_value: 5000,
        status: 'IN_PROGRESS'
      };

      dailyChallengeRepository.findByDate.mockResolvedValue(mockChallenge);
      dailyChallengeRepository.findUserProgress.mockResolvedValue(mockProgress);

      const result = await challengeService.getTodayChallenge({ idUserProfile: 1 });

      expect(result.challenge).toEqual(mockChallenge);
      expect(result.progress).toEqual(mockProgress);
      expect(dailyChallengeRepository.findByDate).toHaveBeenCalledWith(
        '2025-01-15',
        { includeTemplate: true }
      );
    });

    it('should return null if no challenge exists for today', async () => {
      dailyChallengeRepository.findByDate.mockResolvedValue(null);

      const result = await challengeService.getTodayChallenge(1);

      expect(result).toBeNull();
    });
  });

  describe('createDailyChallenge', () => {
    it('should create a new daily challenge', async () => {
      const command = {
        challengeDate: '2025-01-16',
        title: 'Burn 500 calories',
        description: 'Complete workouts to burn 500 calories',
        challengeType: 'CALORIES',
        targetValue: 500,
        targetUnit: 'kcal',
        tokensReward: 50,
        difficulty: 'MEDIUM'
      };

      dailyChallengeRepository.findByDate.mockResolvedValue(null);
      dailyChallengeRepository.create.mockResolvedValue({ id_challenge: 2, ...command });

      const result = await challengeService.createDailyChallenge(command);

      expect(result.id_challenge).toBe(2);
      expect(dailyChallengeRepository.create).toHaveBeenCalled();
    });

    it('should throw error if challenge already exists for date', async () => {
      const command = {
        challengeDate: '2025-01-15',
        title: 'Test'
      };

      dailyChallengeRepository.findByDate.mockResolvedValue({ id_challenge: 1 });

      await expect(challengeService.createDailyChallenge(command))
        .rejects.toThrow('Ya existe un desafío para esta fecha');
    });
  });

  describe('startChallenge', () => {
    it('should start a challenge for a user', async () => {
      const command = {
        idUserProfile: 1,
        idChallenge: 1
      };

      const mockProgress = {
        id_user_challenge: 1,
        id_user_profile: 1,
        id_challenge: 1,
        current_value: 0,
        status: 'IN_PROGRESS'
      };

      dailyChallengeRepository.findUserProgress.mockResolvedValue(null);
      dailyChallengeRepository.createUserProgress.mockResolvedValue(mockProgress);

      const result = await challengeService.startChallenge(command);

      expect(result).toEqual(mockProgress);
      expect(dailyChallengeRepository.createUserProgress).toHaveBeenCalledWith({
        id_user_profile: 1,
        id_challenge: 1,
        current_value: 0,
        status: 'IN_PROGRESS'
      });
    });

    it('should return existing progress if already started', async () => {
      const command = {
        idUserProfile: 1,
        idChallenge: 1
      };

      const existingProgress = {
        id_user_challenge: 1,
        status: 'IN_PROGRESS',
        current_value: 500
      };

      dailyChallengeRepository.findUserProgress.mockResolvedValue(existingProgress);

      const result = await challengeService.startChallenge(command);

      expect(result).toEqual(existingProgress);
      expect(dailyChallengeRepository.createUserProgress).not.toHaveBeenCalled();
    });
  });

  describe('updateChallengeProgress', () => {
    it('should update progress and auto-start if needed', async () => {
      const challenge = {
        id_challenge: 1,
        target_value: 10000
      };

      dailyChallengeRepository.findById.mockResolvedValue(challenge);
      dailyChallengeRepository.findUserProgress.mockResolvedValue(null);
      dailyChallengeRepository.createUserProgress.mockResolvedValue({
        id_user_challenge: 1,
        current_value: 0,
        status: 'IN_PROGRESS'
      });
      dailyChallengeRepository.updateUserProgress.mockResolvedValue({
        id_user_challenge: 1,
        current_value: 5000,
        status: 'IN_PROGRESS'
      });

      const result = await challengeService.updateChallengeProgress({
        idUserProfile: 1,
        idChallenge: 1,
        currentValue: 5000
      });

      expect(result.current_value).toBe(5000);
      expect(dailyChallengeRepository.updateUserProgress).toHaveBeenCalled();
    });

    it('should mark challenge as completed when target reached', async () => {
      const challenge = {
        id_challenge: 1,
        target_value: 10000
      };

      const progress = {
        id_user_challenge: 1,
        current_value: 8000,
        status: 'IN_PROGRESS'
      };

      dailyChallengeRepository.findById.mockResolvedValue(challenge);
      dailyChallengeRepository.findUserProgress.mockResolvedValue(progress);
      dailyChallengeRepository.updateUserProgress.mockResolvedValue({
        ...progress,
        current_value: 10000,
        status: 'COMPLETED',
        completed_at: new Date()
      });

      const result = await challengeService.updateChallengeProgress({
        idUserProfile: 1,
        idChallenge: 1,
        currentValue: 10000
      });

      expect(result.status).toBe('COMPLETED');
      expect(dailyChallengeRepository.updateUserProgress).toHaveBeenCalledWith(
        1,
        1,
        expect.objectContaining({
          current_value: 10000,
          status: 'COMPLETED'
        })
      );
    });
  });

  describe('claimChallengeReward', () => {
    it('should award tokens and sync achievements', async () => {
      const progress = {
        id_user_challenge: 1,
        status: 'COMPLETED',
        reward_claimed_at: null
      };

      const challenge = {
        id_challenge: 1,
        tokens_reward: 50
      };

      dailyChallengeRepository.findUserProgress.mockResolvedValue(progress);
      dailyChallengeRepository.findById.mockResolvedValue(challenge);
      dailyChallengeRepository.updateUserProgress.mockResolvedValue(progress);
      tokenLedgerService.registrarMovimiento.mockResolvedValue({});
      achievementService.syncAllAchievementsForUser.mockResolvedValue([]);

      const result = await challengeService.claimChallengeReward({
        idUserProfile: 1,
        idChallenge: 1
      });

      expect(result.tokens_awarded).toBe(50);
      expect(tokenLedgerService.registrarMovimiento).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          delta: 50
        })
      );
      expect(achievementService.syncAllAchievementsForUser).toHaveBeenCalledWith(
        1,
        expect.any(Object)
      );
    });

    it('should throw error if challenge not completed', async () => {
      const progress = {
        status: 'IN_PROGRESS'
      };

      dailyChallengeRepository.findUserProgress.mockResolvedValue(progress);

      await expect(challengeService.claimChallengeReward({
        idUserProfile: 1,
        idChallenge: 1
      })).rejects.toThrow('El desafío no está completado');
    });

    it('should throw error if reward already claimed', async () => {
      const progress = {
        status: 'COMPLETED',
        reward_claimed_at: new Date()
      };

      dailyChallengeRepository.findUserProgress.mockResolvedValue(progress);

      await expect(challengeService.claimChallengeReward({
        idUserProfile: 1,
        idChallenge: 1
      })).rejects.toThrow('La recompensa ya fue reclamada');
    });
  });

  describe('updateProgress (legacy)', () => {
    it('should update progress and auto-claim reward on completion', async () => {
      const challenge = {
        id_challenge: 1,
        challenge_date: '2025-01-15',
        is_active: true,
        target_value: 1000,
        tokens_reward: 25
      };

      dailyChallengeRepository.findById.mockResolvedValue(challenge);
      dailyChallengeRepository.findUserProgress.mockResolvedValue({
        current_value: 500,
        status: 'IN_PROGRESS',
        reward_claimed_at: null
      });
      dailyChallengeRepository.updateUserProgress.mockResolvedValue({
        current_value: 1000,
        status: 'COMPLETED',
        reward_claimed_at: null
      });
      tokenLedgerService.registrarMovimiento.mockResolvedValue({});
      achievementService.syncAllAchievementsForUser.mockResolvedValue([]);

      const result = await challengeService.updateProgress(1, 1, 1000);

      expect(result.progress).toBe(1000);
      expect(result.completed).toBe(true);
      expect(result.tokens_earned).toBe(25);
    });

    it('should throw error if challenge is not for today', async () => {
      const challenge = {
        id_challenge: 1,
        challenge_date: '2025-01-14',
        is_active: true
      };

      dailyChallengeRepository.findById.mockResolvedValue(challenge);

      await expect(challengeService.updateProgress(1, 1, 1000))
        .rejects.toThrow('El desafío no corresponde al día de hoy');
    });
  });

  describe('getChallengeSettings', () => {
    it('should return challenge settings', async () => {
      const settings = {
        id_settings: 1,
        auto_rotation_enabled: true,
        default_tokens_reward: 50
      };

      dailyChallengeRepository.getSettings.mockResolvedValue(settings);

      const result = await challengeService.getChallengeSettings();

      expect(result).toEqual(settings);
    });
  });

  describe('listChallengeTemplates', () => {
    it('should list active templates', async () => {
      const templates = [
        { id_template: 1, title: 'Template 1', is_active: true },
        { id_template: 2, title: 'Template 2', is_active: true }
      ];

      dailyChallengeRepository.listTemplates.mockResolvedValue({
        rows: templates,
        count: 2
      });

      const result = await challengeService.listChallengeTemplates({ isActive: true });

      expect(result.items).toHaveLength(2);
      expect(dailyChallengeRepository.listTemplates).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({ isActive: true })
        })
      );
    });
  });
});
