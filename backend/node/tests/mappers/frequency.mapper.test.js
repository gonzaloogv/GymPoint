const {
  toFrequency,
  toFrequencies,
  toFrequencyHistory,
  toFrequencyHistories
} = require('../../infra/db/mappers/frequency.mapper');

describe('Frequency DB Mapper', () => {
  describe('toFrequency', () => {
    it('should map Sequelize instance to POJO', () => {
      const instance = {
        dataValues: {
          id_frequency: 1,
          id_user_profile: 1,
          goal: 3,
          assist: 2,
          achieved_goal: false,
          week_start_date: '2025-01-06',
          week_number: 2,
          year: 2025,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-15T00:00:00Z'
        },
        get: jest.fn().mockImplementation(function() { return this.dataValues; })
      };

      const result = toFrequency(instance);

      expect(result).toEqual({
        id_frequency: 1,
        id_user_profile: 1,
        goal: 3,
        assist: 2,
        achieved_goal: false,
        week_start_date: '2025-01-06',
        week_number: 2,
        year: 2025,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-15T00:00:00Z'
      });
    });

    it('should return null for null input', () => {
      expect(toFrequency(null)).toBeNull();
    });

    it('should set defaults for missing fields', () => {
      const instance = {
        dataValues: {
          id_frequency: 1,
          id_user_profile: 1
        },
        get: jest.fn().mockImplementation(function() { return this.dataValues; })
      };

      const result = toFrequency(instance);

      expect(result.goal).toBe(3);
      expect(result.assist).toBe(0);
    });
  });

  describe('toFrequencies', () => {
    it('should map array of instances', () => {
      const instances = [
        {
          dataValues: { id_frequency: 1, goal: 3 },
          get: jest.fn().mockImplementation(function() { return this.dataValues; })
        },
        {
          dataValues: { id_frequency: 2, goal: 4 },
          get: jest.fn().mockImplementation(function() { return this.dataValues; })
        }
      ];

      const result = toFrequencies(instances);

      expect(result).toHaveLength(2);
      expect(result[0].id_frequency).toBe(1);
      expect(result[1].id_frequency).toBe(2);
    });

    it('should return empty array for empty input', () => {
      expect(toFrequencies([])).toEqual([]);
    });
  });

  describe('toFrequencyHistory', () => {
    it('should map history correctly', () => {
      const instance = {
        dataValues: {
          id_history: 1,
          id_user_profile: 1,
          week_start_date: '2025-01-06',
          week_end_date: '2025-01-12',
          goal: 3,
          achieved: 3,
          goal_met: true,
          tokens_earned: 20,
          created_at: '2025-01-13T00:00:00Z'
        },
        get: jest.fn().mockImplementation(function() { return this.dataValues; })
      };

      const result = toFrequencyHistory(instance);

      expect(result).toEqual({
        id_history: 1,
        id_user_profile: 1,
        week_start_date: '2025-01-06',
        week_end_date: '2025-01-12',
        goal: 3,
        achieved: 3,
        goal_met: true,
        tokens_earned: 20,
        created_at: '2025-01-13T00:00:00Z'
      });
    });

    it('should return null for null input', () => {
      expect(toFrequencyHistory(null)).toBeNull();
    });
  });

  describe('toFrequencyHistories', () => {
    it('should map array of history instances', () => {
      const instances = [
        {
          dataValues: { id_history: 1, goal_met: true },
          get: jest.fn().mockImplementation(function() { return this.dataValues; })
        },
        {
          dataValues: { id_history: 2, goal_met: false },
          get: jest.fn().mockImplementation(function() { return this.dataValues; })
        }
      ];

      const result = toFrequencyHistories(instances);

      expect(result).toHaveLength(2);
      expect(result[0].goal_met).toBe(true);
      expect(result[1].goal_met).toBe(false);
    });

    it('should return empty array for empty input', () => {
      expect(toFrequencyHistories([])).toEqual([]);
    });
  });
});
