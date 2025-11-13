jest.mock('../infra/db/repositories', () => ({
  exerciseRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByIdWithCreator: jest.fn(),
    findAllWithCount: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn()
  }
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

const exerciseService = require('../services/exercise-service');
const { exerciseRepository } = require('../infra/db/repositories');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Exercise Service - CQRS Pattern', () => {
  describe('Queries', () => {
    describe('getAllExercises', () => {
      it('should return all exercises', async () => {
        const mockExercises = [
          {
            id_exercise: 1,
            exercise_name: 'Press de banca',
            muscular_group: 'Pecho'
          },
          {
            id_exercise: 2,
            exercise_name: 'Sentadilla',
            muscular_group: 'Piernas'
          }
        ];
        exerciseRepository.findAll.mockResolvedValue(mockExercises);

        const result = await exerciseService.getAllExercises();

        expect(exerciseRepository.findAll).toHaveBeenCalledWith({
          filters: {
            muscularGroup: undefined,
            difficulty: undefined,
            equipmentNeeded: undefined
          },
          pagination: {
            limit: undefined,
            offset: undefined
          },
          sort: {
            field: 'exercise_name',
            order: 'ASC'
          }
        });
        expect(result).toEqual(mockExercises);
      });

      it('should filter by muscular group', async () => {
        const mockExercises = [
          {
            id_exercise: 1,
            exercise_name: 'Press de banca',
            muscular_group: 'Pecho'
          }
        ];
        exerciseRepository.findAll.mockResolvedValue(mockExercises);

        const result = await exerciseService.getAllExercises({ muscularGroup: 'Pecho' });

        expect(exerciseRepository.findAll).toHaveBeenCalledWith({
          filters: {
            muscularGroup: 'Pecho',
            difficulty: undefined,
            equipmentNeeded: undefined
          },
          pagination: {
            limit: undefined,
            offset: undefined
          },
          sort: {
            field: 'exercise_name',
            order: 'ASC'
          }
        });
        expect(result).toEqual(mockExercises);
      });
    });

    describe('listExercises', () => {
      it('should return paginated exercises', async () => {
        const mockExercises = [
          { id_exercise: 1, exercise_name: 'Press de banca' },
          { id_exercise: 2, exercise_name: 'Sentadilla' }
        ];
        exerciseRepository.findAllWithCount.mockResolvedValue({
          rows: mockExercises,
          count: 25
        });

        const result = await exerciseService.listExercises({ page: 1, limit: 10 });

        expect(exerciseRepository.findAllWithCount).toHaveBeenCalledWith({
          filters: {
            muscularGroup: undefined,
            difficulty: undefined,
            equipmentNeeded: undefined
          },
          pagination: {
            limit: 10,
            offset: 0
          },
          sort: {
            field: 'exercise_name',
            order: 'ASC'
          }
        });
        expect(result).toEqual({
          items: mockExercises,
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3
        });
      });

      it('should default to page 1 and limit 20', async () => {
        exerciseRepository.findAllWithCount.mockResolvedValue({
          rows: [],
          count: 0
        });

        await exerciseService.listExercises({});

        expect(exerciseRepository.findAllWithCount).toHaveBeenCalledWith({
          filters: {
            muscularGroup: undefined,
            difficulty: undefined,
            equipmentNeeded: undefined
          },
          pagination: {
            limit: 20,
            offset: 0
          },
          sort: {
            field: 'exercise_name',
            order: 'ASC'
          }
        });
      });
    });

    describe('getExerciseById', () => {
      it('should return exercise by id', async () => {
        const mockExercise = {
          id_exercise: 1,
          exercise_name: 'Press de banca',
          muscular_group: 'Pecho'
        };
        exerciseRepository.findById.mockResolvedValue(mockExercise);

        const result = await exerciseService.getExerciseById(1);

        expect(exerciseRepository.findById).toHaveBeenCalledWith(1);
        expect(result).toEqual(mockExercise);
      });

      it('should throw NotFoundError when exercise not found', async () => {
        exerciseRepository.findById.mockResolvedValue(null);

        await expect(exerciseService.getExerciseById(999))
          .rejects
          .toThrow('Ejercicio');
      });

      it('should accept object with idExercise', async () => {
        const mockExercise = { id_exercise: 1 };
        exerciseRepository.findById.mockResolvedValue(mockExercise);

        await exerciseService.getExerciseById({ idExercise: 1 });

        expect(exerciseRepository.findById).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Commands', () => {
    describe('createExercise', () => {
      it('should create new exercise', async () => {
        const mockExercise = {
          id_exercise: 1,
          exercise_name: 'Press de banca',
          muscular_group: 'Pecho',
          created_by: 10
        };
        exerciseRepository.create.mockResolvedValue(mockExercise);

        const result = await exerciseService.createExercise({
          exerciseName: 'Press de banca',
          muscularGroup: 'Pecho',
          createdBy: 10
        });

        expect(exerciseRepository.create).toHaveBeenCalledWith({
          exercise_name: 'Press de banca',
          muscular_group: 'Pecho',
          description: undefined,
          equipment_needed: undefined,
          difficulty: undefined,
          instructions: undefined,
          video_url: undefined,
          created_by: 10
        });
        expect(result).toEqual(mockExercise);
      });
    });

    describe('updateExercise', () => {
      it('should update existing exercise', async () => {
        const existingExercise = {
          id_exercise: 1,
          exercise_name: 'Press de banca',
          muscular_group: 'Pecho'
        };
        const updatedExercise = {
          id_exercise: 1,
          exercise_name: 'Press de banca modificado',
          muscular_group: 'Pecho'
        };
        exerciseRepository.findById.mockResolvedValue(existingExercise);
        exerciseRepository.update.mockResolvedValue(updatedExercise);

        const result = await exerciseService.updateExercise({
          idExercise: 1,
          exerciseName: 'Press de banca modificado'
        });

        expect(exerciseRepository.findById).toHaveBeenCalledWith(1);
        expect(exerciseRepository.update).toHaveBeenCalledWith(1, {
          exercise_name: 'Press de banca modificado'
        });
        expect(result).toEqual(updatedExercise);
      });

      it('should throw NotFoundError when exercise not found', async () => {
        exerciseRepository.findById.mockResolvedValue(null);

        await expect(exerciseService.updateExercise({ idExercise: 999, exerciseName: 'Test' }))
          .rejects
          .toThrow('Ejercicio');
      });
    });

    describe('deleteExercise', () => {
      it('should delete exercise', async () => {
        const existingExercise = { id_exercise: 1, exercise_name: 'Test' };
        exerciseRepository.findById.mockResolvedValue(existingExercise);
        exerciseRepository.deleteById.mockResolvedValue(true);

        await exerciseService.deleteExercise(1);

        expect(exerciseRepository.findById).toHaveBeenCalledWith(1);
        expect(exerciseRepository.deleteById).toHaveBeenCalledWith(1);
      });

      it('should throw NotFoundError when exercise not found', async () => {
        exerciseRepository.findById.mockResolvedValue(null);

        await expect(exerciseService.deleteExercise(999))
          .rejects
          .toThrow('Ejercicio');
      });

      it('should accept object with idExercise', async () => {
        const existingExercise = { id_exercise: 1 };
        exerciseRepository.findById.mockResolvedValue(existingExercise);
        exerciseRepository.deleteById.mockResolvedValue(true);

        await exerciseService.deleteExercise({ idExercise: 1 });

        expect(exerciseRepository.deleteById).toHaveBeenCalledWith(1);
      });
    });
  });
});
