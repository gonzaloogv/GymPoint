const { toStreak, toStreaks } = require('../../infra/db/mappers/streak.mapper');

describe('Streak DB Mapper', () => {
  describe('toStreak', () => {
    it('should map Sequelize instance to POJO', () => {
      const instance = {
        dataValues: {
          id_streak: 1,
          id_user_profile: 1,
          value: 15,
          last_value: 10,
          max_value: 20,
          recovery_items: 2,
          last_assistance_date: '2025-01-15T08:00:00Z',
          id_frequency: 1,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-15T00:00:00Z'
        },
        get: jest.fn().mockImplementation(function() { return this.dataValues; })
      };

      const result = toStreak(instance);

      expect(result).toEqual({
        id_streak: 1,
        id_user_profile: 1,
        value: 15,
        last_value: 10,
        max_value: 20,
        recovery_items: 2,
        last_assistance_date: '2025-01-15T08:00:00Z',
        id_frequency: 1,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-15T00:00:00Z'
      });
    });

    it('should handle userProfile relation', () => {
      const instance = {
        dataValues: {
          id_streak: 1,
          value: 10,
          userProfile: {
            id_user_profile: 1,
            name: 'John',
            lastname: 'Doe'
          }
        },
        get: jest.fn().mockImplementation(function() { return this.dataValues; })
      };

      const result = toStreak(instance);

      expect(result.userProfile).toEqual({
        id_user_profile: 1,
        name: 'John',
        lastname: 'Doe'
      });
    });

    it('should handle frequency relation', () => {
      const instance = {
        dataValues: {
          id_streak: 1,
          value: 10,
          frequency: {
            id_frequency: 1,
            goal: 3,
            assist: 2,
            achieved_goal: false
          }
        },
        get: jest.fn().mockImplementation(function() { return this.dataValues; })
      };

      const result = toStreak(instance);

      expect(result.frequency).toEqual({
        id_frequency: 1,
        goal: 3,
        assist: 2,
        achieved_goal: false
      });
    });

    it('should return null for null input', () => {
      expect(toStreak(null)).toBeNull();
    });

    it('should set defaults for missing fields', () => {
      const instance = {
        dataValues: {
          id_streak: 1,
          id_user_profile: 1
        },
        get: jest.fn().mockImplementation(function() { return this.dataValues; })
      };

      const result = toStreak(instance);

      expect(result.value).toBe(0);
      expect(result.last_value).toBe(0);
      expect(result.max_value).toBe(0);
      expect(result.recovery_items).toBe(0);
    });
  });

  describe('toStreaks', () => {
    it('should map array of instances', () => {
      const instances = [
        {
          dataValues: { id_streak: 1, value: 10 },
          get: jest.fn().mockImplementation(function() { return this.dataValues; })
        },
        {
          dataValues: { id_streak: 2, value: 15 },
          get: jest.fn().mockImplementation(function() { return this.dataValues; })
        }
      ];

      const result = toStreaks(instances);

      expect(result).toHaveLength(2);
      expect(result[0].id_streak).toBe(1);
      expect(result[1].id_streak).toBe(2);
    });

    it('should return empty array for empty input', () => {
      expect(toStreaks([])).toEqual([]);
      expect(toStreaks(null)).toEqual([]);
    });
  });
});
