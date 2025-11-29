/**
 * Tests para frequency-service - Reset Week Operations
 * Cubre: resetWeek (operación compleja con transacciones, historial, streaks, tokens)
 */

const {
  mockFrequencyRepository,
  mockStreakRepository,
  mockStreakService,
  mockTokenLedgerService,
  mockSequelize,
  mockTransaction,
  mockErrors,
  frequencyService,
} = require('./test-setup');

const { TOKENS, TOKEN_REASONS } = require('../../../../config/constants');

describe('frequency-service reset week', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-27T12:00:00Z')); // Lunes semana 5
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('resetWeek', () => {
    it('resetea todas las frecuencias y otorga tokens por meta cumplida', async () => {
      const mockFrequency = {
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
        assist: 3, // Cumplió meta
        week_start_date: '2025-01-20',
        week_number: 4,
        year: 2025,
        pending_goal: null,
      };

      mockFrequencyRepository.findAll.mockResolvedValue([mockFrequency]);
      mockFrequencyRepository.update.mockResolvedValue({});
      mockFrequencyRepository.createHistory.mockResolvedValue({
        id_history: 1,
      });
      mockStreakRepository.findByUserProfileId.mockResolvedValue(null);
      mockTokenLedgerService.registrarMovimiento.mockResolvedValue({});

      await frequencyService.resetWeek();

      expect(mockSequelize.transaction).toHaveBeenCalled();
      expect(mockFrequencyRepository.createHistory).toHaveBeenCalledWith(
        {
          id_user_profile: 10,
          week_start_date: '2025-01-20',
          week_end_date: '2025-01-25', // 6 días después del inicio
          goal: 3,
          achieved: 3,
          goal_met: true,
          tokens_earned: TOKENS.WEEKLY_BONUS,
          created_at: expect.any(Date),
        },
        { transaction: mockTransaction }
      );
      expect(mockTokenLedgerService.registrarMovimiento).toHaveBeenCalledWith({
        userId: 10,
        delta: TOKENS.WEEKLY_BONUS,
        reason: TOKEN_REASONS.WEEKLY_BONUS,
        refType: 'frequency_history',
        refId: 1,
        transaction: mockTransaction,
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('no otorga tokens si meta no fue cumplida', async () => {
      const mockFrequency = {
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
        assist: 2, // No cumplió meta
        week_start_date: '2025-01-20',
        week_number: 4,
        year: 2025,
        pending_goal: null,
      };

      mockFrequencyRepository.findAll.mockResolvedValue([mockFrequency]);
      mockFrequencyRepository.update.mockResolvedValue({});
      mockFrequencyRepository.createHistory.mockResolvedValue({
        id_history: 1,
      });
      mockStreakRepository.findByUserProfileId.mockResolvedValue(null);

      await frequencyService.resetWeek();

      expect(mockFrequencyRepository.createHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          goal_met: false,
          tokens_earned: 0,
        }),
        { transaction: mockTransaction }
      );
      expect(mockTokenLedgerService.registrarMovimiento).not.toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('resetea streak si meta no fue cumplida', async () => {
      const mockFrequency = {
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
        assist: 1,
        week_start_date: '2025-01-20',
        week_number: 4,
        year: 2025,
      };

      const mockStreak = {
        id_streak: 1,
        id_user_profile: 10,
        value: 5,
        last_assistance_date: '2025-01-25',
      };

      mockFrequencyRepository.findAll.mockResolvedValue([mockFrequency]);
      mockFrequencyRepository.update.mockResolvedValue({});
      mockFrequencyRepository.createHistory.mockResolvedValue({});
      mockStreakRepository.findByUserProfileId.mockResolvedValue(mockStreak);
      mockStreakService.updateStreak.mockResolvedValue({
        value: 0,
      });

      await frequencyService.resetWeek();

      expect(mockStreakRepository.findByUserProfileId).toHaveBeenCalledWith(10, {
        transaction: mockTransaction,
      });
      expect(mockStreakService.updateStreak).toHaveBeenCalledWith({
        idStreak: 1,
        idUserProfile: 10,
        continuaRacha: false,
        lossResetValue: 0,
        lossResetDate: '2025-01-25',
        updateMaxOnLoss: true,
        transaction: mockTransaction,
      });
    });

    it('no resetea streak si meta fue cumplida', async () => {
      const mockFrequency = {
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
        assist: 3, // Cumplió meta
        week_start_date: '2025-01-20',
      };

      mockFrequencyRepository.findAll.mockResolvedValue([mockFrequency]);
      mockFrequencyRepository.update.mockResolvedValue({});
      mockFrequencyRepository.createHistory.mockResolvedValue({ id_history: 1 });
      mockTokenLedgerService.registrarMovimiento.mockResolvedValue({});

      await frequencyService.resetWeek();

      expect(mockStreakRepository.findByUserProfileId).not.toHaveBeenCalled();
      expect(mockStreakService.updateStreak).not.toHaveBeenCalled();
    });

    it('aplica pending_goal al resetear semana', async () => {
      const mockFrequency = {
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
        assist: 3,
        week_start_date: '2025-01-20',
        week_number: 4,
        year: 2025,
        pending_goal: 5, // Nueva meta pendiente
      };

      mockFrequencyRepository.findAll.mockResolvedValue([mockFrequency]);
      mockFrequencyRepository.update.mockResolvedValue({});
      mockFrequencyRepository.createHistory.mockResolvedValue({ id_history: 1 });
      mockTokenLedgerService.registrarMovimiento.mockResolvedValue({});

      await frequencyService.resetWeek();

      expect(mockFrequencyRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          goal: 5,
          pending_goal: null,
          assist: 0,
          achieved_goal: false,
        }),
        { transaction: mockTransaction }
      );
    });

    it('no aplica pending_goal si no existe', async () => {
      const mockFrequency = {
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
        assist: 3,
        week_start_date: '2025-01-20',
        pending_goal: null,
      };

      mockFrequencyRepository.findAll.mockResolvedValue([mockFrequency]);
      mockFrequencyRepository.update.mockResolvedValue({});
      mockFrequencyRepository.createHistory.mockResolvedValue({ id_history: 1 });
      mockTokenLedgerService.registrarMovimiento.mockResolvedValue({});

      await frequencyService.resetWeek();

      const updateCall = mockFrequencyRepository.update.mock.calls[0][1];
      expect(updateCall.goal).toBeUndefined();
    });

    it('inicializa metadata de semana para frecuencias sin week_start_date', async () => {
      const mockFrequency = {
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
        assist: 0,
        week_start_date: null, // Sin inicializar
      };

      mockFrequencyRepository.findAll.mockResolvedValue([mockFrequency]);
      mockFrequencyRepository.update.mockResolvedValue({});

      await frequencyService.resetWeek();

      expect(mockFrequencyRepository.update).toHaveBeenCalledWith(
        1,
        {
          week_start_date: expect.any(String),
          week_number: expect.any(Number),
          year: 2025,
          assist: 0,
          achieved_goal: false,
        },
        { transaction: mockTransaction }
      );
      expect(mockFrequencyRepository.createHistory).not.toHaveBeenCalled();
    });

    it('hace rollback si falla creación de historial', async () => {
      const mockFrequency = {
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
        assist: 3,
        week_start_date: '2025-01-20',
      };

      mockFrequencyRepository.findAll.mockResolvedValue([mockFrequency]);
      mockFrequencyRepository.update.mockResolvedValue({});
      mockFrequencyRepository.createHistory.mockRejectedValue(new Error('DB Error'));

      await expect(frequencyService.resetWeek()).rejects.toThrow('DB Error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    it('hace rollback si falla actualización de streak', async () => {
      const mockFrequency = {
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
        assist: 1,
        week_start_date: '2025-01-20',
      };

      mockFrequencyRepository.findAll.mockResolvedValue([mockFrequency]);
      mockFrequencyRepository.update.mockResolvedValue({});
      mockFrequencyRepository.createHistory.mockResolvedValue({});
      mockStreakRepository.findByUserProfileId.mockResolvedValue({
        id_streak: 1,
        value: 3,
        last_assistance_date: '2025-01-25',
      });
      mockStreakService.updateStreak.mockRejectedValue(new Error('Streak Error'));

      await expect(frequencyService.resetWeek()).rejects.toThrow('Streak Error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    it('hace rollback si falla registro de tokens', async () => {
      const mockFrequency = {
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
        assist: 3,
        week_start_date: '2025-01-20',
      };

      mockFrequencyRepository.findAll.mockResolvedValue([mockFrequency]);
      mockFrequencyRepository.update.mockResolvedValue({});
      mockFrequencyRepository.createHistory.mockResolvedValue({ id_history: 1 });
      mockTokenLedgerService.registrarMovimiento.mockRejectedValue(new Error('Token Error'));

      await expect(frequencyService.resetWeek()).rejects.toThrow('Token Error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    it('procesa múltiples frecuencias en una misma transacción', async () => {
      const mockFrequencies = [
        {
          id_frequency: 1,
          id_user_profile: 10,
          goal: 3,
          assist: 3,
          week_start_date: '2025-01-20',
        },
        {
          id_frequency: 2,
          id_user_profile: 20,
          goal: 4,
          assist: 2,
          week_start_date: '2025-01-20',
        },
      ];

      mockFrequencyRepository.findAll.mockResolvedValue(mockFrequencies);
      mockFrequencyRepository.update.mockResolvedValue({});
      mockFrequencyRepository.createHistory.mockResolvedValue({ id_history: 1 });
      mockStreakRepository.findByUserProfileId.mockResolvedValue(null);
      mockTokenLedgerService.registrarMovimiento.mockResolvedValue({});

      await frequencyService.resetWeek();

      expect(mockFrequencyRepository.createHistory).toHaveBeenCalledTimes(2);
      expect(mockFrequencyRepository.update).toHaveBeenCalledTimes(2);
      expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
    });
  });
});
