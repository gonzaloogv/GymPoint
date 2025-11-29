/**
 * Tests para frequency-service - Query Operations
 * Cubre: getUserFrequency, listFrequencyHistory, getFrequencyStats
 */

const {
  mockFrequencyRepository,
  mockStreakRepository,
  mockErrors,
  frequencyService,
} = require('./test-setup');

describe('frequency-service queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserFrequency', () => {
    it('obtiene frecuencia por ID de usuario como objeto', async () => {
      const mockFrequency = {
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
        assist: 2,
        week_number: 4,
        year: 2025,
      };

      mockFrequencyRepository.findByUserProfileId.mockResolvedValue(mockFrequency);

      const result = await frequencyService.getUserFrequency({ idUserProfile: 10 });

      expect(mockFrequencyRepository.findByUserProfileId).toHaveBeenCalledWith(10, {
        includeRelations: true,
      });
      expect(result).toEqual(mockFrequency);
    });

    it('acepta ID de usuario como número directo', async () => {
      const mockFrequency = {
        id_frequency: 1,
        id_user_profile: 10,
        goal: 3,
      };

      mockFrequencyRepository.findByUserProfileId.mockResolvedValue(mockFrequency);

      const result = await frequencyService.getUserFrequency(10);

      expect(mockFrequencyRepository.findByUserProfileId).toHaveBeenCalledWith(10, {
        includeRelations: true,
      });
      expect(result).toEqual(mockFrequency);
    });

    it('lanza NotFoundError si frecuencia no existe', async () => {
      mockFrequencyRepository.findByUserProfileId.mockResolvedValue(null);

      await expect(frequencyService.getUserFrequency({ idUserProfile: 999 })).rejects.toThrow(
        mockErrors.NotFoundError
      );
      await expect(frequencyService.getUserFrequency({ idUserProfile: 999 })).rejects.toThrow(
        'Meta semanal del usuario'
      );
    });

    it('obtiene frecuencia existente sin crear nueva', async () => {
      const mockFrequency = {
        id_frequency: 1,
        id_user_profile: 10,
        weekly_goal: 4,
      };

      mockFrequencyRepository.findByUserProfileId.mockResolvedValue(mockFrequency);

      await frequencyService.getUserFrequency(10);

      expect(mockFrequencyRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('listFrequencyHistory', () => {
    it('lista historial con paginación por defecto', async () => {
      const mockHistory = [
        {
          id_history: 1,
          id_user_profile: 10,
          week_start_date: '2025-01-13',
          week_end_date: '2025-01-19',
          achieved: 3,
          goal: 3,
          goal_met: true,
        },
        {
          id_history: 2,
          id_user_profile: 10,
          week_start_date: '2025-01-20',
          week_end_date: '2025-01-26',
          achieved: 2,
          goal: 3,
          goal_met: false,
        },
      ];

      mockFrequencyRepository.listHistory.mockResolvedValue({
        rows: mockHistory,
        count: 2,
      });

      const result = await frequencyService.listFrequencyHistory({
        idUserProfile: 10,
      });

      expect(mockFrequencyRepository.listHistory).toHaveBeenCalledWith({
        idUserProfile: 10,
        pagination: {
          limit: 20,
          offset: 0,
        },
        filters: {
          startDate: null,
          endDate: null,
          goalMet: null,
        },
      });

      expect(result).toEqual({
        items: mockHistory,
        total: 2,
        page: 1,
        limit: 20,
      });
    });

    it('aplica paginación personalizada', async () => {
      mockFrequencyRepository.listHistory.mockResolvedValue({
        rows: [],
        count: 50,
      });

      const result = await frequencyService.listFrequencyHistory({
        idUserProfile: 10,
        page: 3,
        limit: 10,
      });

      expect(mockFrequencyRepository.listHistory).toHaveBeenCalledWith({
        idUserProfile: 10,
        pagination: {
          limit: 10,
          offset: 20, // (page - 1) * limit = (3 - 1) * 10
        },
        filters: {
          startDate: null,
          endDate: null,
          goalMet: null,
        },
      });

      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
    });

    it('aplica filtros de fecha y estado completado', async () => {
      mockFrequencyRepository.listHistory.mockResolvedValue({
        rows: [],
        count: 0,
      });

      await frequencyService.listFrequencyHistory({
        idUserProfile: 10,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        goalMet: true,
      });

      expect(mockFrequencyRepository.listHistory).toHaveBeenCalledWith({
        idUserProfile: 10,
        pagination: {
          limit: 20,
          offset: 0,
        },
        filters: {
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          goalMet: true,
        },
      });
    });

    it('retorna lista vacía si no hay historial', async () => {
      mockFrequencyRepository.listHistory.mockResolvedValue({
        rows: [],
        count: 0,
      });

      const result = await frequencyService.listFrequencyHistory({
        idUserProfile: 10,
      });

      expect(result).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
      });
    });
  });

  describe('getFrequencyStats', () => {
    it('obtiene estadísticas completas de frecuencia', async () => {
      const mockStats = {
        total_weeks: 10,
        completed_weeks: 7,
        total_assists: 25,
        average_assists: 2.5,
        completion_rate: 0.7,
        current_streak: 3,
        best_streak: 5,
      };

      mockFrequencyRepository.getStats.mockResolvedValue(mockStats);

      const result = await frequencyService.getFrequencyStats({
        idUserProfile: 10,
      });

      expect(mockFrequencyRepository.getStats).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockStats);
    });

    it('acepta ID de usuario como número directo', async () => {
      const mockStats = {
        total_weeks: 5,
        completed_weeks: 3,
      };

      mockFrequencyRepository.getStats.mockResolvedValue(mockStats);

      const result = await frequencyService.getFrequencyStats(10);

      expect(mockFrequencyRepository.getStats).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockStats);
    });

    it('retorna estadísticas vacías si usuario no tiene historial', async () => {
      mockFrequencyRepository.getStats.mockResolvedValue({
        total_weeks: 0,
        completed_weeks: 0,
        total_assists: 0,
        average_assists: 0,
        completion_rate: 0,
        current_streak: 0,
        best_streak: 0,
      });

      const result = await frequencyService.getFrequencyStats({ idUserProfile: 999 });

      expect(result.total_weeks).toBe(0);
      expect(result.completion_rate).toBe(0);
    });

    it('calcula tasa de completado correctamente', async () => {
      const mockStats = {
        total_weeks: 10,
        completed_weeks: 8,
        completion_rate: 0.8,
      };

      mockFrequencyRepository.getStats.mockResolvedValue(mockStats);

      const result = await frequencyService.getFrequencyStats(10);

      expect(result.completion_rate).toBe(0.8);
    });

    it('incluye información de racha actual y mejor racha', async () => {
      const mockStats = {
        total_weeks: 20,
        completed_weeks: 15,
        current_streak: 4,
        best_streak: 7,
      };

      mockFrequencyRepository.getStats.mockResolvedValue(mockStats);

      const result = await frequencyService.getFrequencyStats(10);

      expect(result.current_streak).toBe(4);
      expect(result.best_streak).toBe(7);
    });
  });
});
