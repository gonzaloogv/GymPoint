/**
 * Tests para exercise-service
 * Cubre: getAllExercises, listExercises, getExerciseById, createExercise, updateExercise, deleteExercise
 */

// Mock del repositorio
const mockExerciseRepository = {
  findAll: jest.fn(),
  findAllWithCount: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deleteById: jest.fn(),
};

jest.mock('../../../infra/db/repositories', () => ({
  exerciseRepository: mockExerciseRepository,
}));

const { NotFoundError } = require('../../../utils/errors');
const exerciseService = require('../../../services/exercise-service');

describe('exercise-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllExercises', () => {
    it('obtiene todos los ejercicios sin filtros', async () => {
      const mockExercises = [
        { id_exercise: 1, exercise_name: 'Press banca' },
        { id_exercise: 2, exercise_name: 'Sentadilla' },
      ];

      mockExerciseRepository.findAll.mockResolvedValue(mockExercises);

      const result = await exerciseService.getAllExercises({});

      expect(mockExerciseRepository.findAll).toHaveBeenCalledWith({
        filters: {
          muscularGroup: undefined,
          difficulty: undefined,
          equipmentNeeded: undefined,
        },
        pagination: {
          limit: undefined,
          offset: undefined,
        },
        sort: {
          field: 'exercise_name',
          order: 'ASC',
        },
      });

      expect(result).toEqual(mockExercises);
    });

    it('aplica filtros de grupo muscular y dificultad', async () => {
      const mockExercises = [{ id_exercise: 1, exercise_name: 'Press banca' }];

      mockExerciseRepository.findAll.mockResolvedValue(mockExercises);

      await exerciseService.getAllExercises({
        muscularGroup: 'PECHO',
        difficulty: 'INTERMEDIO',
        equipmentNeeded: true,
      });

      expect(mockExerciseRepository.findAll).toHaveBeenCalledWith({
        filters: {
          muscularGroup: 'PECHO',
          difficulty: 'INTERMEDIO',
          equipmentNeeded: true,
        },
        pagination: {
          limit: undefined,
          offset: undefined,
        },
        sort: {
          field: 'exercise_name',
          order: 'ASC',
        },
      });
    });

    it('aplica ordenamiento personalizado', async () => {
      mockExerciseRepository.findAll.mockResolvedValue([]);

      await exerciseService.getAllExercises({
        sortBy: 'difficulty',
        order: 'DESC',
      });

      expect(mockExerciseRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: {
            field: 'difficulty',
            order: 'DESC',
          },
        })
      );
    });
  });

  describe('listExercises', () => {
    it('lista ejercicios con paginación por defecto', async () => {
      const mockExercises = [
        { id_exercise: 1, exercise_name: 'Press banca' },
        { id_exercise: 2, exercise_name: 'Sentadilla' },
      ];

      mockExerciseRepository.findAllWithCount.mockResolvedValue({
        rows: mockExercises,
        count: 2,
      });

      const result = await exerciseService.listExercises({});

      expect(mockExerciseRepository.findAllWithCount).toHaveBeenCalledWith({
        filters: {
          muscularGroup: undefined,
          difficulty: undefined,
          equipmentNeeded: undefined,
        },
        pagination: {
          limit: 20,
          offset: 0,
        },
        sort: {
          field: 'exercise_name',
          order: 'ASC',
        },
      });

      expect(result).toEqual({
        items: mockExercises,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('aplica paginación personalizada', async () => {
      mockExerciseRepository.findAllWithCount.mockResolvedValue({
        rows: [],
        count: 50,
      });

      const result = await exerciseService.listExercises({
        page: 3,
        limit: 10,
      });

      expect(mockExerciseRepository.findAllWithCount).toHaveBeenCalledWith({
        filters: {
          muscularGroup: undefined,
          difficulty: undefined,
          equipmentNeeded: undefined,
        },
        pagination: {
          limit: 10,
          offset: 20, // (page - 1) * limit = (3 - 1) * 10
        },
        sort: {
          field: 'exercise_name',
          order: 'ASC',
        },
      });

      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(5); // Math.ceil(50 / 10)
    });

    it('calcula totalPages correctamente', async () => {
      mockExerciseRepository.findAllWithCount.mockResolvedValue({
        rows: [],
        count: 25,
      });

      const result = await exerciseService.listExercises({ limit: 10 });

      expect(result.totalPages).toBe(3); // Math.ceil(25 / 10)
    });
  });

  describe('getExerciseById', () => {
    it('obtiene ejercicio por ID como objeto', async () => {
      const mockExercise = {
        id_exercise: 1,
        exercise_name: 'Press banca',
        muscular_group: 'PECHO',
      };

      mockExerciseRepository.findById.mockResolvedValue(mockExercise);

      const result = await exerciseService.getExerciseById({ idExercise: 1 });

      expect(mockExerciseRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockExercise);
    });

    it('acepta ID como número directo', async () => {
      const mockExercise = { id_exercise: 1, exercise_name: 'Sentadilla' };

      mockExerciseRepository.findById.mockResolvedValue(mockExercise);

      const result = await exerciseService.getExerciseById(1);

      expect(mockExerciseRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockExercise);
    });

    it('lanza NotFoundError si ejercicio no existe', async () => {
      mockExerciseRepository.findById.mockResolvedValue(null);

      await expect(exerciseService.getExerciseById({ idExercise: 999 })).rejects.toThrow(
        NotFoundError
      );
      await expect(exerciseService.getExerciseById({ idExercise: 999 })).rejects.toThrow(
        'Ejercicio'
      );
    });
  });

  describe('createExercise', () => {
    it('crea ejercicio exitosamente', async () => {
      const command = {
        exerciseName: 'Press banca',
        muscularGroup: 'PECHO',
        description: 'Ejercicio para pectorales',
        equipmentNeeded: true,
        difficulty: 'INTERMEDIO',
        instructions: 'Acostarse en banco y empujar',
        videoUrl: 'https://example.com/video',
        createdBy: 1,
      };

      const mockCreated = {
        id_exercise: 1,
        exercise_name: 'Press banca',
        muscular_group: 'PECHO',
      };

      mockExerciseRepository.create.mockResolvedValue(mockCreated);

      const result = await exerciseService.createExercise(command);

      expect(mockExerciseRepository.create).toHaveBeenCalledWith({
        exercise_name: 'Press banca',
        muscular_group: 'PECHO',
        description: 'Ejercicio para pectorales',
        equipment_needed: true,
        difficulty: 'INTERMEDIO',
        instructions: 'Acostarse en banco y empujar',
        video_url: 'https://example.com/video',
        created_by: 1,
      });

      expect(result).toEqual(mockCreated);
    });

    it('crea ejercicio con campos mínimos', async () => {
      const command = {
        exerciseName: 'Flexiones',
        muscularGroup: 'PECHO',
      };

      mockExerciseRepository.create.mockResolvedValue({ id_exercise: 2 });

      await exerciseService.createExercise(command);

      expect(mockExerciseRepository.create).toHaveBeenCalledWith({
        exercise_name: 'Flexiones',
        muscular_group: 'PECHO',
        description: undefined,
        equipment_needed: undefined,
        difficulty: undefined,
        instructions: undefined,
        video_url: undefined,
        created_by: undefined,
      });
    });
  });

  describe('updateExercise', () => {
    it('actualiza ejercicio exitosamente', async () => {
      const command = {
        idExercise: 1,
        exerciseName: 'Press banca inclinado',
        description: 'Nueva descripción',
        difficulty: 'AVANZADO',
      };

      mockExerciseRepository.findById.mockResolvedValue({
        id_exercise: 1,
        exercise_name: 'Press banca',
      });

      const mockUpdated = {
        id_exercise: 1,
        exercise_name: 'Press banca inclinado',
      };

      mockExerciseRepository.update.mockResolvedValue(mockUpdated);

      const result = await exerciseService.updateExercise(command);

      expect(mockExerciseRepository.findById).toHaveBeenCalledWith(1);
      expect(mockExerciseRepository.update).toHaveBeenCalledWith(1, {
        exercise_name: 'Press banca inclinado',
        description: 'Nueva descripción',
        difficulty: 'AVANZADO',
      });

      expect(result).toEqual(mockUpdated);
    });

    it('actualiza solo campos especificados', async () => {
      const command = {
        idExercise: 1,
        videoUrl: 'https://new-video.com',
      };

      mockExerciseRepository.findById.mockResolvedValue({ id_exercise: 1 });
      mockExerciseRepository.update.mockResolvedValue({ id_exercise: 1 });

      await exerciseService.updateExercise(command);

      expect(mockExerciseRepository.update).toHaveBeenCalledWith(1, {
        video_url: 'https://new-video.com',
      });
    });

    it('permite actualizar todos los campos', async () => {
      const command = {
        idExercise: 1,
        exerciseName: 'Nuevo nombre',
        muscularGroup: 'PIERNAS',
        description: 'Nueva desc',
        equipmentNeeded: false,
        difficulty: 'PRINCIPIANTE',
        instructions: 'Nuevas instrucciones',
        videoUrl: 'https://new.com',
      };

      mockExerciseRepository.findById.mockResolvedValue({ id_exercise: 1 });
      mockExerciseRepository.update.mockResolvedValue({ id_exercise: 1 });

      await exerciseService.updateExercise(command);

      expect(mockExerciseRepository.update).toHaveBeenCalledWith(1, {
        exercise_name: 'Nuevo nombre',
        muscular_group: 'PIERNAS',
        description: 'Nueva desc',
        equipment_needed: false,
        difficulty: 'PRINCIPIANTE',
        instructions: 'Nuevas instrucciones',
        video_url: 'https://new.com',
      });
    });

    it('lanza NotFoundError si ejercicio no existe', async () => {
      const command = {
        idExercise: 999,
        exerciseName: 'Nuevo nombre',
      };

      mockExerciseRepository.findById.mockResolvedValue(null);

      await expect(exerciseService.updateExercise(command)).rejects.toThrow(NotFoundError);
      await expect(exerciseService.updateExercise(command)).rejects.toThrow('Ejercicio');

      expect(mockExerciseRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteExercise', () => {
    it('elimina ejercicio por ID como objeto', async () => {
      mockExerciseRepository.findById.mockResolvedValue({
        id_exercise: 1,
        exercise_name: 'Press banca',
      });
      mockExerciseRepository.deleteById.mockResolvedValue(true);

      const result = await exerciseService.deleteExercise({ idExercise: 1 });

      expect(mockExerciseRepository.findById).toHaveBeenCalledWith(1);
      expect(mockExerciseRepository.deleteById).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('acepta ID como número directo', async () => {
      mockExerciseRepository.findById.mockResolvedValue({ id_exercise: 1 });
      mockExerciseRepository.deleteById.mockResolvedValue(true);

      await exerciseService.deleteExercise(1);

      expect(mockExerciseRepository.findById).toHaveBeenCalledWith(1);
      expect(mockExerciseRepository.deleteById).toHaveBeenCalledWith(1);
    });

    it('lanza NotFoundError si ejercicio no existe', async () => {
      mockExerciseRepository.findById.mockResolvedValue(null);

      await expect(exerciseService.deleteExercise({ idExercise: 999 })).rejects.toThrow(
        NotFoundError
      );
      await expect(exerciseService.deleteExercise({ idExercise: 999 })).rejects.toThrow(
        'Ejercicio'
      );

      expect(mockExerciseRepository.deleteById).not.toHaveBeenCalled();
    });
  });
});
