/**
 * Progress Service Tests - CQRS Pattern
 * Tests for Progress service with repository-level mocking
 */

jest.mock('../infra/db/repositories', () => ({
  progressRepository: {
    findById: jest.fn(),
    findByUserProfile: jest.fn(),
    getWeightStats: jest.fn(),
    getExerciseHistory: jest.fn(),
    getPersonalRecord: jest.fn(),
    getExerciseAverages: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn()
  }
}));

jest.mock('../config/database', () => ({
  transaction: jest.fn(async (callback) => callback({}))
}));

jest.mock('../utils/errors', () => ({
  NotFoundError: class NotFoundError extends Error {
    constructor(msg) {
      super(msg);
      this.name = 'NotFoundError';
    }
  },
  ValidationError: class ValidationError extends Error {
    constructor(msg) {
      super(msg);
      this.name = 'ValidationError';
    }
  }
}));

const progressService = require('../services/progress-service');
const { progressRepository } = require('../infra/db/repositories');
const { NotFoundError } = require('../utils/errors');

describe('Progress Service - CQRS Pattern', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== QUERIES ====================

  describe('Queries', () => {

    describe('getProgressById', () => {
      it('debería obtener un progreso por ID', async () => {
        const mockProgress = {
          id_progress: 1,
          id_user_profile: 10,
          date: '2025-01-15',
          total_weight_lifted: 5000,
          total_reps: 100,
          total_sets: 20
        };
        progressRepository.findById.mockResolvedValue(mockProgress);

        const query = { idProgress: 1 };
        const result = await progressService.getProgressById(query);

        expect(result).toEqual(mockProgress);
        expect(progressRepository.findById).toHaveBeenCalledWith(1);
      });

      it('debería lanzar NotFoundError si no existe el progreso', async () => {
        progressRepository.findById.mockResolvedValue(null);

        const query = { idProgress: 999 };
        await expect(progressService.getProgressById(query)).rejects.toThrow(NotFoundError);
        expect(progressRepository.findById).toHaveBeenCalledWith(999);
      });
    });

    describe('getUserProgress', () => {
      it('debería obtener el progreso de un usuario', async () => {
        const mockProgressList = [
          {
            id_progress: 1,
            id_user_profile: 10,
            date: '2025-01-15',
            total_weight_lifted: 5000
          },
          {
            id_progress: 2,
            id_user_profile: 10,
            date: '2025-01-14',
            total_weight_lifted: 4800
          }
        ];
        progressRepository.findByUserProfile.mockResolvedValue(mockProgressList);

        const query = { idUserProfile: 10 };
        const result = await progressService.getUserProgress(query);

        expect(result).toEqual(mockProgressList);
        expect(progressRepository.findByUserProfile).toHaveBeenCalledWith(10, {
          limit: undefined,
          offset: undefined,
          includeExercises: false
        });
      });

      it('debería aplicar limit y offset', async () => {
        const mockProgressList = [
          { id_progress: 1, id_user_profile: 10 }
        ];
        progressRepository.findByUserProfile.mockResolvedValue(mockProgressList);

        const query = { idUserProfile: 10, limit: 10, offset: 5, includeExercises: true };
        const result = await progressService.getUserProgress(query);

        expect(result).toEqual(mockProgressList);
        expect(progressRepository.findByUserProfile).toHaveBeenCalledWith(10, {
          limit: 10,
          offset: 5,
          includeExercises: true
        });
      });
    });

    describe('getWeightStats', () => {
      it('debería obtener estadísticas de peso para un usuario', async () => {
        const mockStats = [
          { date: '2025-01-15', total_weight_lifted: 5000, total_reps: 100, total_sets: 20 },
          { date: '2025-01-14', total_weight_lifted: 4800, total_reps: 95, total_sets: 19 }
        ];
        progressRepository.getWeightStats.mockResolvedValue(mockStats);

        const query = {
          idUserProfile: 10,
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        };
        const result = await progressService.getWeightStats(query);

        expect(result).toEqual(mockStats);
        expect(progressRepository.getWeightStats).toHaveBeenCalledWith(10, {
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        });
      });

      it('debería funcionar sin fechas especificadas', async () => {
        const mockStats = [
          { date: '2025-01-15', total_weight_lifted: 5000 }
        ];
        progressRepository.getWeightStats.mockResolvedValue(mockStats);

        const query = { idUserProfile: 10 };
        const result = await progressService.getWeightStats(query);

        expect(result).toEqual(mockStats);
        expect(progressRepository.getWeightStats).toHaveBeenCalledWith(10, {
          startDate: undefined,
          endDate: undefined
        });
      });
    });

    describe('getExerciseHistory', () => {
      it('debería obtener el historial de ejercicios para un usuario', async () => {
        const mockHistory = [
          {
            date: '2025-01-15',
            idExercise: 5,
            exerciseName: 'Bench Press',
            muscularGroup: 'CHEST',
            usedWeight: 80,
            reps: 10,
            sets: 3
          }
        ];
        progressRepository.getExerciseHistory.mockResolvedValue(mockHistory);

        const query = { idUserProfile: 10, limit: 100 };
        const result = await progressService.getExerciseHistory(query);

        expect(result).toEqual(mockHistory);
        expect(progressRepository.getExerciseHistory).toHaveBeenCalledWith(10, {
          idExercise: undefined,
          limit: 100
        });
      });

      it('debería obtener historial de un ejercicio específico', async () => {
        const mockHistory = [
          {
            date: '2025-01-15',
            idExercise: 5,
            exerciseName: 'Bench Press',
            usedWeight: 80,
            reps: 10,
            sets: 3
          }
        ];
        progressRepository.getExerciseHistory.mockResolvedValue(mockHistory);

        const query = { idUserProfile: 10, idExercise: 5, limit: 50 };
        const result = await progressService.getExerciseHistory(query);

        expect(result).toEqual(mockHistory);
        expect(progressRepository.getExerciseHistory).toHaveBeenCalledWith(10, {
          idExercise: 5,
          limit: 50
        });
      });
    });

    describe('getPersonalRecord', () => {
      it('debería obtener el récord personal de un ejercicio', async () => {
        const mockPR = {
          date: '2025-01-15',
          usedWeight: 100,
          reps: 8,
          sets: 3
        };
        progressRepository.getPersonalRecord.mockResolvedValue(mockPR);

        const query = { idUserProfile: 10, idExercise: 5 };
        const result = await progressService.getPersonalRecord(query);

        expect(result).toEqual(mockPR);
        expect(progressRepository.getPersonalRecord).toHaveBeenCalledWith(10, 5);
      });

      it('debería retornar null si no hay récords', async () => {
        progressRepository.getPersonalRecord.mockResolvedValue(null);

        const query = { idUserProfile: 10, idExercise: 999 };
        const result = await progressService.getPersonalRecord(query);

        expect(result).toBeNull();
        expect(progressRepository.getPersonalRecord).toHaveBeenCalledWith(10, 999);
      });
    });

    describe('getExerciseAverages', () => {
      it('debería obtener los promedios de un ejercicio', async () => {
        const mockAverages = {
          averageWeight: 85.5,
          averageReps: 9.2,
          averageSets: 3.1,
          totalRecords: 10
        };
        progressRepository.getExerciseAverages.mockResolvedValue(mockAverages);

        const query = { idUserProfile: 10, idExercise: 5 };
        const result = await progressService.getExerciseAverages(query);

        expect(result).toEqual(mockAverages);
        expect(progressRepository.getExerciseAverages).toHaveBeenCalledWith(10, 5);
      });

      it('debería retornar null si no hay datos', async () => {
        progressRepository.getExerciseAverages.mockResolvedValue(null);

        const query = { idUserProfile: 10, idExercise: 999 };
        const result = await progressService.getExerciseAverages(query);

        expect(result).toBeNull();
        expect(progressRepository.getExerciseAverages).toHaveBeenCalledWith(10, 999);
      });
    });

  });

  // ==================== COMMANDS ====================

  describe('Commands', () => {

    describe('registerProgress', () => {
      it('debería registrar un nuevo progreso', async () => {
        const mockProgress = {
          id_progress: 1,
          id_user_profile: 10,
          date: '2025-01-15',
          total_weight_lifted: 5000,
          total_reps: 100,
          total_sets: 20,
          notes: 'Great workout'
        };
        progressRepository.create.mockResolvedValue(mockProgress);

        const command = {
          idUserProfile: 10,
          date: '2025-01-15',
          totalWeightLifted: 5000,
          totalReps: 100,
          totalSets: 20,
          notes: 'Great workout',
          exercises: []
        };
        const result = await progressService.registerProgress(command);

        expect(result).toEqual(mockProgress);
        expect(progressRepository.create).toHaveBeenCalledWith({
          idUserProfile: 10,
          date: '2025-01-15',
          totalWeightLifted: 5000,
          totalReps: 100,
          totalSets: 20,
          notes: 'Great workout',
          exercises: []
        }, { transaction: {} });
      });

      it('debería registrar progreso con ejercicios', async () => {
        const mockProgress = {
          id_progress: 1,
          id_user_profile: 10,
          date: '2025-01-15'
        };
        progressRepository.create.mockResolvedValue(mockProgress);

        const command = {
          idUserProfile: 10,
          date: '2025-01-15',
          totalWeightLifted: 5000,
          totalReps: 100,
          totalSets: 20,
          exercises: [
            { idExercise: 5, usedWeight: 80, reps: 10, sets: 3 }
          ]
        };
        const result = await progressService.registerProgress(command);

        expect(result).toEqual(mockProgress);
        expect(progressRepository.create).toHaveBeenCalledWith({
          idUserProfile: 10,
          date: '2025-01-15',
          totalWeightLifted: 5000,
          totalReps: 100,
          totalSets: 20,
          notes: undefined,
          exercises: [
            { idExercise: 5, usedWeight: 80, reps: 10, sets: 3 }
          ]
        }, { transaction: {} });
      });
    });

    describe('updateProgress', () => {
      it('debería actualizar un progreso existente', async () => {
        const mockProgress = {
          id_progress: 1,
          id_user_profile: 10,
          date: '2025-01-15',
          total_weight_lifted: 5200,
          total_reps: 105,
          total_sets: 21
        };
        progressRepository.update.mockResolvedValue(mockProgress);

        const command = {
          idProgress: 1,
          date: '2025-01-15',
          totalWeightLifted: 5200,
          totalReps: 105,
          totalSets: 21
        };
        const result = await progressService.updateProgress(command);

        expect(result).toEqual(mockProgress);
        expect(progressRepository.update).toHaveBeenCalledWith(1, {
          date: '2025-01-15',
          totalWeightLifted: 5200,
          totalReps: 105,
          totalSets: 21,
          notes: undefined
        }, { transaction: {} });
      });

      it('debería lanzar NotFoundError si el progreso no existe', async () => {
        progressRepository.update.mockResolvedValue(null);

        const command = {
          idProgress: 999,
          totalWeightLifted: 5200
        };
        await expect(progressService.updateProgress(command)).rejects.toThrow(NotFoundError);
        expect(progressRepository.update).toHaveBeenCalledWith(999, {
          date: undefined,
          totalWeightLifted: 5200,
          totalReps: undefined,
          totalSets: undefined,
          notes: undefined
        }, { transaction: {} });
      });
    });

    describe('deleteProgress', () => {
      it('debería eliminar un progreso existente', async () => {
        progressRepository.deleteById.mockResolvedValue(true);

        const command = { idProgress: 1 };
        await progressService.deleteProgress(command);

        expect(progressRepository.deleteById).toHaveBeenCalledWith(1, { transaction: {} });
      });

      it('debería lanzar NotFoundError si el progreso no existe', async () => {
        progressRepository.deleteById.mockResolvedValue(false);

        const command = { idProgress: 999 };
        await expect(progressService.deleteProgress(command)).rejects.toThrow(NotFoundError);
        expect(progressRepository.deleteById).toHaveBeenCalledWith(999, { transaction: {} });
      });
    });

  });

  // ==================== LEGACY ALIASES ====================

  describe('Legacy Aliases', () => {

    it('registrarProgreso debería llamar a registerProgress', async () => {
      const mockProgress = { id_progress: 1 };
      progressRepository.create.mockResolvedValue(mockProgress);

      const data = {
        id_user_profile: 10,
        date: '2025-01-15',
        total_weight_lifted: 5000,
        ejercicios: []
      };
      const result = await progressService.registrarProgreso(data);

      expect(result).toEqual(mockProgress);
      expect(progressRepository.create).toHaveBeenCalled();
    });

    it('obtenerProgresoPorUsuario debería llamar a getUserProgress', async () => {
      const mockProgressList = [{ id_progress: 1 }];
      progressRepository.findByUserProfile.mockResolvedValue(mockProgressList);

      const result = await progressService.obtenerProgresoPorUsuario(10);

      expect(result).toEqual(mockProgressList);
      expect(progressRepository.findByUserProfile).toHaveBeenCalledWith(10, {
        limit: undefined,
        offset: undefined,
        includeExercises: false
      });
    });

    it('obtenerEstadisticaPeso debería llamar a getWeightStats', async () => {
      const mockStats = [{ date: '2025-01-15', total_weight_lifted: 5000 }];
      progressRepository.getWeightStats.mockResolvedValue(mockStats);

      const result = await progressService.obtenerEstadisticaPeso(10);

      expect(result).toEqual(mockStats);
      expect(progressRepository.getWeightStats).toHaveBeenCalledWith(10, {
        startDate: undefined,
        endDate: undefined
      });
    });

    it('obtenerHistorialEjercicios debería llamar a getExerciseHistory', async () => {
      const mockHistory = [{ date: '2025-01-15', idExercise: 5 }];
      progressRepository.getExerciseHistory.mockResolvedValue(mockHistory);

      const result = await progressService.obtenerHistorialEjercicios(10);

      expect(result).toEqual(mockHistory);
      expect(progressRepository.getExerciseHistory).toHaveBeenCalledWith(10, {
        idExercise: undefined,
        limit: 100
      });
    });

    it('obtenerMejorLevantamiento debería llamar a getPersonalRecord', async () => {
      const mockPR = { date: '2025-01-15', usedWeight: 100 };
      progressRepository.getPersonalRecord.mockResolvedValue(mockPR);

      const result = await progressService.obtenerMejorLevantamiento(10, 5);

      expect(result).toEqual(mockPR);
      expect(progressRepository.getPersonalRecord).toHaveBeenCalledWith(10, 5);
    });

    it('obtenerPromedioLevantamiento debería llamar a getExerciseAverages', async () => {
      const mockAverages = { averageWeight: 85.5, averageReps: 9.2 };
      progressRepository.getExerciseAverages.mockResolvedValue(mockAverages);

      const result = await progressService.obtenerPromedioLevantamiento(10, 5);

      expect(result).toEqual(mockAverages);
      expect(progressRepository.getExerciseAverages).toHaveBeenCalledWith(10, 5);
    });

  });

});
