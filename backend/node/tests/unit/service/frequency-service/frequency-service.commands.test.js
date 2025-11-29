/**
 * Tests para frequency-service - Command Operations
 * Cubre: createWeeklyGoal, updateWeeklyGoal, incrementAssistance, updateFrequencyUser (legacy)
 */

const {
  mockFrequencyRepository,
  mockStreakRepository,
  mockStreakService,
  mockErrors,
  frequencyService,
} = require('./test-setup');

describe('frequency-service commands', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createWeeklyGoal', () => {
    it('crea frecuencia inicial con meta semanal', async () => {
      const command = {
        idUserProfile: 10,
        goal: 3,
      };

      mockFrequencyRepository.findByUserProfileId.mockResolvedValue(null);

      const mockCreated = {
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
        assist: 0,
        week_number: 4,
        year: 2025,
      };

      mockFrequencyRepository.create.mockResolvedValue(mockCreated);

      const result = await frequencyService.createWeeklyGoal(command);

      expect(mockFrequencyRepository.create).toHaveBeenCalledWith(
        {
          id_user_profile: 10,
          goal: 3,
          pending_goal: null,
          assist: 0,
          achieved_goal: false,
          week_start_date: expect.any(String),
          week_number: expect.any(Number),
          year: expect.any(Number),
        },
        {
          transaction: undefined,
        }
      );

      expect(result).toEqual(mockCreated);
    });

    it('actualiza frecuencia existente si ya existe', async () => {
      const command = {
        idUserProfile: 10,
        goal: 4,
      };

      mockFrequencyRepository.findByUserProfileId.mockResolvedValue({
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
      });

      const mockUpdated = {
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
        pending_goal: 4,
      };

      mockFrequencyRepository.updateByUserProfileId.mockResolvedValue(mockUpdated);

      const result = await frequencyService.createWeeklyGoal(command);

      expect(mockFrequencyRepository.updateByUserProfileId).toHaveBeenCalledWith(
        10,
        {
          pending_goal: 4,
        },
        {
          transaction: undefined,
        }
      );

      expect(result).toEqual(mockUpdated);
      expect(mockFrequencyRepository.create).not.toHaveBeenCalled();
    });

    it('inicializa semana actual correctamente', async () => {
      const command = {
        idUserProfile: 10,
        goal: 3,
      };

      mockFrequencyRepository.findByUserProfileId.mockResolvedValue(null);
      mockFrequencyRepository.create.mockResolvedValue({
        id_frequency: 1,
        week_number: 4,
        year: 2025,
      });

      // Mock de fecha para controlar la semana
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-27T12:00:00Z')); // Lunes semana 5

      await frequencyService.createWeeklyGoal(command);

      expect(mockFrequencyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          week_number: expect.any(Number),
          year: 2025,
        }),
        {
          transaction: undefined,
        }
      );

      jest.useRealTimers();
    });
  });

  describe('updateWeeklyGoal', () => {
    it('actualiza meta semanal existente', async () => {
      const command = {
        idUserProfile: 10,
        goal: 5,
      };

      mockFrequencyRepository.findByUserProfileId.mockResolvedValue({
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
      });

      const mockUpdated = {
        id_frequency: 1,
        id_user_profile: 10,
        goal: 5,
      };

      mockFrequencyRepository.updateByUserProfileId.mockResolvedValue(mockUpdated);

      const result = await frequencyService.updateWeeklyGoal(command);

      expect(mockFrequencyRepository.updateByUserProfileId).toHaveBeenCalledWith(
        10,
        {
          goal: 5,
        },
        {
          transaction: undefined,
        }
      );

      expect(result).toEqual(mockUpdated);
    });

    it('lanza NotFoundError si frecuencia no existe', async () => {
      const command = {
        idUserProfile: 999,
        goal: 4,
      };

      mockFrequencyRepository.findByUserProfileId.mockResolvedValue(null);

      await expect(frequencyService.updateWeeklyGoal(command)).rejects.toThrow(
        mockErrors.NotFoundError
      );
      await expect(frequencyService.updateWeeklyGoal(command)).rejects.toThrow(
        'Meta semanal del usuario'
      );
    });

    it('solo actualiza goal si está definido', async () => {
      const command = {
        idUserProfile: 10,
        goal: undefined,
      };

      mockFrequencyRepository.findByUserProfileId.mockResolvedValue({
        id_frequency: 1,
        goal: 3,
      });
      mockFrequencyRepository.updateByUserProfileId.mockResolvedValue({
        goal: 3,
      });

      await frequencyService.updateWeeklyGoal(command);

      expect(mockFrequencyRepository.updateByUserProfileId).toHaveBeenCalledWith(
        10,
        {},
        {
          transaction: undefined,
        }
      );
    });
  });

  describe('incrementAssistance', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-27T12:00:00Z')); // Lunes semana 5
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('incrementa asistencia exitosamente', async () => {
      const command = {
        idUserProfile: 10,
      };

      mockFrequencyRepository.findByUserProfileId.mockResolvedValue({
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
        assist: 1,
        week_start_date: '2025-01-27',
        week_number: 5,
        year: 2025,
        achieved_goal: false,
      });

      const mockUpdated = {
        id_frequency: 1,
        assist: 2,
      };

      mockFrequencyRepository.incrementAssist.mockResolvedValue(mockUpdated);

      const result = await frequencyService.incrementAssistance(command);

      expect(mockFrequencyRepository.incrementAssist).toHaveBeenCalledWith(10, {
        transaction: undefined,
      });
      expect(result).toEqual(mockUpdated);
    });

    it('acepta ID de usuario como número directo', async () => {
      mockFrequencyRepository.findByUserProfileId.mockResolvedValue({
        id_frequency: 1,
        week_start_date: '2025-01-27',
        week_number: 5,
        year: 2025,
        achieved_goal: false,
      });
      mockFrequencyRepository.incrementAssist.mockResolvedValue({
        assist: 2,
      });

      await frequencyService.incrementAssistance(10);

      expect(mockFrequencyRepository.findByUserProfileId).toHaveBeenCalledWith(10);
      expect(mockFrequencyRepository.incrementAssist).toHaveBeenCalledWith(10, {
        transaction: undefined,
      });
    });

    it('resetea semana si cambió antes de incrementar', async () => {
      mockFrequencyRepository.findByUserProfileId.mockResolvedValue({
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
        assist: 2,
        week_start_date: '2025-01-20', // Semana anterior
        week_number: 4,
        year: 2025,
        achieved_goal: false,
      });

      mockFrequencyRepository.updateByUserProfileId.mockResolvedValue({
        assist: 0,
        week_number: 5,
      });

      mockFrequencyRepository.incrementAssist.mockResolvedValue({
        assist: 1,
      });

      const result = await frequencyService.incrementAssistance(10);

      // Verifica que se llamó al reset de semana
      expect(mockFrequencyRepository.updateByUserProfileId).toHaveBeenCalledWith(10, {
        week_start_date: '2025-01-27',
        week_number: expect.any(Number),
        year: 2025,
        assist: 0,
        achieved_goal: false,
      });

      // Verifica que se llamó al incremento después del reset
      expect(mockFrequencyRepository.incrementAssist).toHaveBeenCalledWith(10, {
        transaction: undefined,
      });
      expect(result.assist).toBe(1);
    });

    it('retorna null si frecuencia no existe', async () => {
      mockFrequencyRepository.findByUserProfileId.mockResolvedValue(null);

      const result = await frequencyService.incrementAssistance({ idUserProfile: 999 });

      expect(result).toBeNull();
      expect(mockFrequencyRepository.incrementAssist).not.toHaveBeenCalled();
    });

    it('no incrementa si ya alcanzó la meta', async () => {
      mockFrequencyRepository.findByUserProfileId.mockResolvedValue({
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
        assist: 3,
        week_start_date: '2025-01-27',
        week_number: 5,
        year: 2025,
        achieved_goal: true, // Ya alcanzó la meta
      });

      const result = await frequencyService.incrementAssistance(10);

      expect(mockFrequencyRepository.incrementAssist).not.toHaveBeenCalled();
      expect(result.achieved_goal).toBe(true);
    });
  });

  describe('updateFrequencyUser (legacy)', () => {
    it('actualiza usuario de frecuencia', async () => {
      mockFrequencyRepository.findById.mockResolvedValue({
        id_frequency: 1,
        id_user_profile: 10,
      });
      mockFrequencyRepository.update.mockResolvedValue({
        id_frequency: 1,
        id_user_profile: 20,
      });

      await frequencyService.updateFrequencyUser(1, 20);

      expect(mockFrequencyRepository.update).toHaveBeenCalledWith(1, {
        id_user_profile: 20,
      });
    });

    it('lanza NotFoundError si frecuencia no existe', async () => {
      mockFrequencyRepository.findById.mockResolvedValue(null);

      await expect(frequencyService.updateFrequencyUser(999, 10)).rejects.toThrow(
        mockErrors.NotFoundError
      );
      await expect(frequencyService.updateFrequencyUser(999, 10)).rejects.toThrow('Frecuencia');
    });
  });
});
