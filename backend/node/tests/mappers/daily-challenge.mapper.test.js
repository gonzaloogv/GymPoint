const {
  toDailyChallenge,
  toDailyChallenges,
  toUserDailyChallenge,
  toUserDailyChallenges,
  toChallengeTemplate,
  toChallengeTemplates,
  toChallengeSettings
} = require('../../infra/db/mappers/daily-challenge.mapper');

describe('Daily Challenge DB Mappers', () => {
  describe('toDailyChallenge', () => {
    it('should map Sequelize instance to POJO', () => {
      const instance = {
        dataValues: {
          id_challenge: 1,
          challenge_date: '2025-01-15',
          title: 'Walk 10000 steps',
          description: 'Complete 10000 steps today',
          challenge_type: 'STEPS',
          target_value: 10000,
          target_unit: 'steps',
          tokens_reward: 50,
          difficulty: 'MEDIUM',
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        get: jest.fn().mockImplementation(function() { return this.dataValues; })
      };

      const result = toDailyChallenge(instance);

      expect(result).toEqual({
        id_challenge: 1,
        challenge_date: '2025-01-15',
        title: 'Walk 10000 steps',
        description: 'Complete 10000 steps today',
        challenge_type: 'STEPS',
        target_value: 10000,
        target_unit: 'steps',
        tokens_reward: 50,
        difficulty: 'MEDIUM',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      });
    });

    it('should return null for null input', () => {
      expect(toDailyChallenge(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(toDailyChallenge(undefined)).toBeNull();
    });

    it('should handle template relation', () => {
      const instance = {
        dataValues: {
          id_challenge: 1,
          title: 'Test',
          template: {
            id_template: 1,
            title: 'Template'
          }
        },
        get: jest.fn().mockImplementation(function() { return this.dataValues; })
      };

      const result = toDailyChallenge(instance);

      expect(result.template).toEqual({
        id_template: 1,
        title: 'Template'
      });
    });
  });

  describe('toDailyChallenges', () => {
    it('should map array of instances', () => {
      const instances = [
        {
          dataValues: { id_challenge: 1, title: 'Challenge 1' },
          get: jest.fn().mockImplementation(function() { return this.dataValues; })
        },
        {
          dataValues: { id_challenge: 2, title: 'Challenge 2' },
          get: jest.fn().mockImplementation(function() { return this.dataValues; })
        }
      ];

      const result = toDailyChallenges(instances);

      expect(result).toHaveLength(2);
      expect(result[0].id_challenge).toBe(1);
      expect(result[1].id_challenge).toBe(2);
    });

    it('should return empty array for empty input', () => {
      expect(toDailyChallenges([])).toEqual([]);
      expect(toDailyChallenges(null)).toEqual([]);
      expect(toDailyChallenges(undefined)).toEqual([]);
    });
  });

  describe('toUserDailyChallenge', () => {
    it('should map user progress correctly', () => {
      const instance = {
        dataValues: {
          id_user_challenge: 1,
          id_user_profile: 1,
          id_challenge: 1,
          current_value: 5000,
          status: 'IN_PROGRESS',
          completed_at: null,
          reward_claimed_at: null,
          started_at: '2025-01-15T08:00:00Z',
          created_at: '2025-01-15T08:00:00Z',
          updated_at: '2025-01-15T10:00:00Z'
        },
        get: jest.fn().mockImplementation(function() { return this.dataValues; })
      };

      const result = toUserDailyChallenge(instance);

      expect(result).toEqual({
        id_user_challenge: 1,
        id_user_profile: 1,
        id_challenge: 1,
        current_value: 5000,
        status: 'IN_PROGRESS',
        completed_at: null,
        reward_claimed_at: null,
        started_at: '2025-01-15T08:00:00Z',
        created_at: '2025-01-15T08:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      });
    });

    it('should handle completed challenge', () => {
      const instance = {
        dataValues: {
          id_user_challenge: 1,
          status: 'COMPLETED',
          current_value: 10000,
          completed_at: '2025-01-15T12:00:00Z',
          reward_claimed_at: '2025-01-15T12:05:00Z'
        },
        get: jest.fn().mockImplementation(function() { return this.dataValues; })
      };

      const result = toUserDailyChallenge(instance);

      expect(result.status).toBe('COMPLETED');
      expect(result.completed_at).toBe('2025-01-15T12:00:00Z');
      expect(result.reward_claimed_at).toBe('2025-01-15T12:05:00Z');
    });
  });

  describe('toChallengeTemplate', () => {
    it('should map template correctly', () => {
      const instance = {
        dataValues: {
          id_template: 1,
          title: 'Daily Steps Challenge',
          description: 'Walk a certain number of steps',
          challenge_type: 'STEPS',
          target_value: 10000,
          target_unit: 'steps',
          tokens_reward: 50,
          difficulty: 'MEDIUM',
          is_active: true,
          weight: 10,
          created_by: 1,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        get: jest.fn().mockImplementation(function() { return this.dataValues; })
      };

      const result = toChallengeTemplate(instance);

      expect(result).toEqual({
        id_template: 1,
        title: 'Daily Steps Challenge',
        description: 'Walk a certain number of steps',
        challenge_type: 'STEPS',
        target_value: 10000,
        target_unit: 'steps',
        tokens_reward: 50,
        difficulty: 'MEDIUM',
        is_active: true,
        weight: 10,
        created_by: 1,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      });
    });
  });

  describe('toChallengeSettings', () => {
    it('should map settings correctly', () => {
      const instance = {
        dataValues: {
          id_settings: 1,
          auto_rotation_enabled: true,
          default_tokens_reward: 50,
          default_difficulty: 'MEDIUM',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        get: jest.fn().mockImplementation(function() { return this.dataValues; })
      };

      const result = toChallengeSettings(instance);

      expect(result).toEqual({
        id_settings: 1,
        auto_rotation_enabled: true,
        default_tokens_reward: 50,
        default_difficulty: 'MEDIUM',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      });
    });

    it('should return null for null input', () => {
      expect(toChallengeSettings(null)).toBeNull();
    });
  });
});
