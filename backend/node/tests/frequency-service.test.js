jest.mock('../infra/db/repositories', () => ({
  frequencyRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    findByUserProfileId: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    updateByUserProfileId: jest.fn(),
    incrementAssist: jest.fn(),
    createHistory: jest.fn(),
    listHistory: jest.fn(),
    getStats: jest.fn()
  }
}));

jest.mock('../services/token-ledger-service', () => ({
  registrarMovimiento: jest.fn()
}));

jest.mock('../config/database', () => ({
  transaction: jest.fn()
}));

jest.mock('../config/constants', () => ({
  TOKENS: { WEEKLY_BONUS: 20 },
  TOKEN_REASONS: { WEEKLY_BONUS: 'WEEKLY_BONUS' }
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

const frequencyService = require('../services/frequency-service');
const { frequencyRepository } = require('../infra/db/repositories');
const tokenLedgerService = require('../services/token-ledger-service');
const sequelize = require('../config/database');

let mockTransaction;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-01-06T09:00:00Z')); // Monday

  mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn()
  };
  sequelize.transaction.mockResolvedValue(mockTransaction);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Frequency Service (Refactored)', () => {
  describe('getUserFrequency', () => {
    it('should return user frequency with relations', async () => {
      const mockFrequency = {
        id_frequency: 1,
        id_user_profile: 1,
        goal: 3,
        assist: 2,
        achieved_goal: false,
        week_start_date: '2025-01-06',
        week_number: 2,
        year: 2025
      };

      frequencyRepository.findByUserProfileId.mockResolvedValue(mockFrequency);

      const result = await frequencyService.getUserFrequency({ idUserProfile: 1 });

      expect(result).toEqual(mockFrequency);
      expect(frequencyRepository.findByUserProfileId).toHaveBeenCalledWith(
        1,
        { includeRelations: true }
      );
    });

    it('should throw NotFoundError if frequency not found', async () => {
      frequencyRepository.findByUserProfileId.mockResolvedValue(null);

      await expect(frequencyService.getUserFrequency(1))
        .rejects.toThrow('Meta semanal del usuario');
    });

    it('should accept plain number as parameter', async () => {
      const mockFrequency = { id_frequency: 1, goal: 3 };
      frequencyRepository.findByUserProfileId.mockResolvedValue(mockFrequency);

      const result = await frequencyService.getUserFrequency(1);

      expect(result).toEqual(mockFrequency);
    });
  });

  describe('listFrequencyHistory', () => {
    it('should list frequency history with pagination', async () => {
      const mockHistory = {
        rows: [
          { id_history: 1, goal_met: true },
          { id_history: 2, goal_met: false }
        ],
        count: 2
      };

      frequencyRepository.listHistory.mockResolvedValue(mockHistory);

      const result = await frequencyService.listFrequencyHistory({
        idUserProfile: 1,
        page: 1,
        limit: 20
      });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it('should filter by date range', async () => {
      frequencyRepository.listHistory.mockResolvedValue({
        rows: [],
        count: 0
      });

      await frequencyService.listFrequencyHistory({
        idUserProfile: 1,
        startDate: '2025-01-01',
        endDate: '2025-01-31'
      });

      expect(frequencyRepository.listHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            startDate: '2025-01-01',
            endDate: '2025-01-31'
          })
        })
      );
    });
  });

  describe('getFrequencyStats', () => {
    it('should return frequency statistics', async () => {
      const mockStats = {
        totalWeeks: 10,
        weeksAchieved: 8,
        achievementRate: 80,
        currentWeek: {
          goal: 3,
          assist: 2,
          progressPercentage: 67
        }
      };

      frequencyRepository.getStats.mockResolvedValue(mockStats);

      const result = await frequencyService.getFrequencyStats({ idUserProfile: 1 });

      expect(result).toEqual(mockStats);
    });
  });

  describe('createWeeklyGoal', () => {
    it('should create new weekly goal if none exists', async () => {
      const mockFrequency = {
        id_frequency: 1,
        id_user_profile: 1,
        goal: 3,
        assist: 0,
        achieved_goal: false,
        week_start_date: '2025-01-06',
        week_number: 2,
        year: 2025
      };

      frequencyRepository.findByUserProfileId.mockResolvedValue(null);
      frequencyRepository.create.mockResolvedValue(mockFrequency);

      const result = await frequencyService.createWeeklyGoal({
        idUserProfile: 1,
        goal: 3
      });

      expect(result).toEqual(mockFrequency);
      expect(frequencyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id_user_profile: 1,
          goal: 3,
          assist: 0,
          achieved_goal: false
        }),
        expect.any(Object)
      );
    });

    it('should update existing weekly goal', async () => {
      const existing = {
        id_frequency: 1,
        goal: 2,
        assist: 5,
        achieved_goal: true
      };

      const updated = {
        ...existing,
        goal: 4,
        assist: 0,
        achieved_goal: false,
        week_start_date: '2025-01-06'
      };

      frequencyRepository.findByUserProfileId.mockResolvedValue(existing);
      frequencyRepository.updateByUserProfileId.mockResolvedValue(updated);

      const result = await frequencyService.createWeeklyGoal({
        idUserProfile: 1,
        goal: 4
      });

      expect(result.goal).toBe(4);
      expect(result.assist).toBe(0);
      expect(result.achieved_goal).toBe(false);
    });
  });

  describe('updateWeeklyGoal', () => {
    it('should update existing goal', async () => {
      const existing = {
        id_frequency: 1,
        goal: 3
      };

      const updated = {
        ...existing,
        goal: 5
      };

      frequencyRepository.findByUserProfileId.mockResolvedValue(existing);
      frequencyRepository.updateByUserProfileId.mockResolvedValue(updated);

      const result = await frequencyService.updateWeeklyGoal({
        idUserProfile: 1,
        goal: 5
      });

      expect(result.goal).toBe(5);
    });

    it('should throw error if frequency not found', async () => {
      frequencyRepository.findByUserProfileId.mockResolvedValue(null);

      await expect(frequencyService.updateWeeklyGoal({
        idUserProfile: 1,
        goal: 5
      })).rejects.toThrow('Meta semanal del usuario');
    });
  });

  describe('incrementAssistance', () => {
    it('should increment assistance and mark goal achieved', async () => {
      const freq = {
        id_frequency: 1,
        goal: 3,
        assist: 2,
        achieved_goal: false,
        week_start_date: '2025-01-06'
      };

      const updated = {
        ...freq,
        assist: 3,
        achieved_goal: true
      };

      frequencyRepository.findByUserProfileId.mockResolvedValue(freq);
      frequencyRepository.incrementAssist.mockResolvedValue(updated);

      const result = await frequencyService.incrementAssistance({ idUserProfile: 1 });

      expect(result.assist).toBe(3);
      expect(result.achieved_goal).toBe(true);
    });

    it('should reset counters if new week started', async () => {
      const freq = {
        id_frequency: 1,
        goal: 3,
        assist: 3,
        achieved_goal: true,
        week_start_date: '2024-12-30' // Old week
      };

      frequencyRepository.findByUserProfileId.mockResolvedValue(freq);
      frequencyRepository.updateByUserProfileId.mockResolvedValue({});
      frequencyRepository.incrementAssist.mockResolvedValue({});

      await frequencyService.incrementAssistance(1);

      expect(frequencyRepository.updateByUserProfileId).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          week_start_date: '2025-01-06',
          assist: 0,
          achieved_goal: false
        }),
        expect.any(Object)
      );
    });

    it('should return null if user has no frequency', async () => {
      frequencyRepository.findByUserProfileId.mockResolvedValue(null);

      const result = await frequencyService.incrementAssistance(1);

      expect(result).toBeNull();
    });

    it('should not increment if goal already achieved', async () => {
      const freq = {
        id_frequency: 1,
        goal: 3,
        assist: 3,
        achieved_goal: true,
        week_start_date: '2025-01-06'
      };

      frequencyRepository.findByUserProfileId.mockResolvedValue(freq);

      const result = await frequencyService.incrementAssistance(1);

      expect(result).toEqual(freq);
      expect(frequencyRepository.incrementAssist).not.toHaveBeenCalled();
    });
  });

  describe('resetWeek', () => {
    it('should archive frequencies and award tokens', async () => {
      const freq = {
        id_frequency: 1,
        id_user_profile: 99,
        goal: 3,
        assist: 3,
        achieved_goal: true,
        week_start_date: '2024-12-30'
      };

      frequencyRepository.findAll.mockResolvedValue([freq]);
      frequencyRepository.createHistory.mockResolvedValue({ id_history: 10 });
      frequencyRepository.update.mockResolvedValue({});

      await frequencyService.resetWeek({ referenceDate: new Date('2025-01-06T09:00:00Z') });

      expect(frequencyRepository.createHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          id_user_profile: 99,
          week_start_date: '2024-12-30',
          goal: 3,
          achieved: 3,
          goal_met: true,
          tokens_earned: 20
        }),
        { transaction: mockTransaction }
      );

      expect(tokenLedgerService.registrarMovimiento).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 99,
          delta: 20,
          reason: 'WEEKLY_BONUS',
          refType: 'frequency_history',
          refId: 10,
          transaction: mockTransaction
        })
      );

      expect(frequencyRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          assist: 0,
          achieved_goal: false,
          week_start_date: '2025-01-06'
        }),
        { transaction: mockTransaction }
      );

      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should not award tokens if goal not met', async () => {
      const freq = {
        id_frequency: 1,
        id_user_profile: 99,
        goal: 3,
        assist: 2,
        achieved_goal: false,
        week_start_date: '2024-12-30'
      };

      frequencyRepository.findAll.mockResolvedValue([freq]);
      frequencyRepository.createHistory.mockResolvedValue({ id_history: 10 });
      frequencyRepository.update.mockResolvedValue({});

      await frequencyService.resetWeek({ referenceDate: new Date('2025-01-06') });

      expect(tokenLedgerService.registrarMovimiento).not.toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {
      frequencyRepository.findAll.mockRejectedValue(new Error('DB error'));

      await expect(frequencyService.resetWeek())
        .rejects.toThrow('DB error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('Legacy aliases', () => {
    it('crearMetaSemanal should work', async () => {
      const mockFrequency = { id_frequency: 1, goal: 3 };
      frequencyRepository.findByUserProfileId.mockResolvedValue(null);
      frequencyRepository.create.mockResolvedValue(mockFrequency);

      const result = await frequencyService.crearMetaSemanal({ id_user: 1, goal: 3 });

      expect(result).toEqual(mockFrequency);
    });

    it('actualizarAsistenciaSemanal should work', async () => {
      const freq = { id_frequency: 1, goal: 3, assist: 2, week_start_date: '2025-01-06' };
      frequencyRepository.findByUserProfileId.mockResolvedValue(freq);
      frequencyRepository.incrementAssist.mockResolvedValue({ ...freq, assist: 3 });

      await frequencyService.actualizarAsistenciaSemanal(1);

      expect(frequencyRepository.incrementAssist).toHaveBeenCalled();
    });

    it('consultarMetaSemanal should work', async () => {
      const mockFrequency = { id_frequency: 1, goal: 3 };
      frequencyRepository.findByUserProfileId.mockResolvedValue(mockFrequency);

      const result = await frequencyService.consultarMetaSemanal(1);

      expect(result).toEqual(mockFrequency);
    });

    it('reiniciarSemana should work', async () => {
      frequencyRepository.findAll.mockResolvedValue([]);

      await frequencyService.reiniciarSemana();

      expect(sequelize.transaction).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });

  describe('Helper functions', () => {
    it('getWeekMetadata should return correct week info', () => {
      const meta = frequencyService.__private.getWeekMetadata(new Date('2025-01-06'));

      expect(meta.weekNumber).toBe(2);
      expect(meta.year).toBe(2025);
      expect(meta.weekStartDate.getDay()).toBe(1); // Monday
    });

    it('startOfISOWeek should return Monday', () => {
      const friday = new Date('2025-01-10'); // Friday
      const monday = frequencyService.__private.startOfISOWeek(friday);

      expect(monday.getDay()).toBe(1); // Monday
      expect(monday.getDate()).toBe(6); // Jan 6
    });
  });
});
