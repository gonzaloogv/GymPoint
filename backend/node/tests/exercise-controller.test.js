jest.mock('../services/exercise-service');
jest.mock('../services/mappers/exercise.mappers');

const controller = require('../controllers/exercise-controller');
const service = require('../services/exercise-service');
const mappers = require('../services/mappers/exercise.mappers');

const createRes = () => ({
  json: jest.fn(),
  status: jest.fn().mockReturnThis(),
  send: jest.fn()
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Exercise Controller - Refactored with Mappers', () => {
  describe('getAllExercises', () => {
    it('should return all exercises with mappers', async () => {
      const req = { query: { muscular_group: 'Pecho' } };
      const res = createRes();

      const mockQuery = { muscularGroup: 'Pecho' };
      const mockExercises = [{ id_exercise: 1, exercise_name: 'Press de banca' }];
      const mockResponse = [{ id_exercise: 1, exercise_name: 'Press de banca' }];

      mappers.toGetAllExercisesQuery.mockReturnValue(mockQuery);
      service.getAllExercises.mockResolvedValue(mockExercises);
      mappers.toExercisesResponse.mockReturnValue(mockResponse);

      await controller.getAllExercises(req, res);

      expect(mappers.toGetAllExercisesQuery).toHaveBeenCalledWith(req.query);
      expect(service.getAllExercises).toHaveBeenCalledWith(mockQuery);
      expect(mappers.toExercisesResponse).toHaveBeenCalledWith(mockExercises);
      expect(res.json).toHaveBeenCalledWith({ data: mockResponse });
    });

    it('should handle errors', async () => {
      const req = { query: {} };
      const res = createRes();

      mappers.toGetAllExercisesQuery.mockReturnValue({});
      service.getAllExercises.mockRejectedValue(new Error('Database error'));

      await controller.getAllExercises(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'GET_EXERCISES_FAILED',
          message: 'Database error'
        }
      });
    });
  });

  describe('getExerciseById', () => {
    it('should return exercise by id', async () => {
      const req = { params: { id: '1' } };
      const res = createRes();

      const mockQuery = { idExercise: 1 };
      const mockExercise = { id_exercise: 1, exercise_name: 'Press de banca' };
      const mockResponse = { id_exercise: 1, exercise_name: 'Press de banca' };

      mappers.toGetExerciseByIdQuery.mockReturnValue(mockQuery);
      service.getExerciseById.mockResolvedValue(mockExercise);
      mappers.toExerciseResponse.mockReturnValue(mockResponse);

      await controller.getExerciseById(req, res);

      expect(mappers.toGetExerciseByIdQuery).toHaveBeenCalledWith(1);
      expect(service.getExerciseById).toHaveBeenCalledWith(mockQuery);
      expect(res.json).toHaveBeenCalledWith({ data: mockResponse });
    });

    it('should return 404 when exercise not found', async () => {
      const req = { params: { id: '999' } };
      const res = createRes();

      const NotFoundError = require('../utils/errors').NotFoundError;
      mappers.toGetExerciseByIdQuery.mockReturnValue({ idExercise: 999 });
      service.getExerciseById.mockRejectedValue(new NotFoundError('Ejercicio'));

      await controller.getExerciseById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.status).toHaveBeenCalledWith(404);
      const call = res.json.mock.calls[0][0];
      expect(call.error.code).toBe('EXERCISE_NOT_FOUND');
    });
  });

  describe('createExercise', () => {
    it('should create exercise with created_by from user', async () => {
      const req = {
        user: { id_user_profile: 5 },
        body: { exercise_name: 'Press de banca', muscular_group: 'Pecho' }
      };
      const res = createRes();

      const mockCommand = { exerciseName: 'Press de banca', muscularGroup: 'Pecho', createdBy: 5 };
      const mockExercise = { id_exercise: 1, exercise_name: 'Press de banca', created_by: 5 };
      const mockResponse = { id_exercise: 1, exercise_name: 'Press de banca', created_by: 5 };

      mappers.toCreateExerciseCommand.mockReturnValue(mockCommand);
      service.createExercise.mockResolvedValue(mockExercise);
      mappers.toExerciseResponse.mockReturnValue(mockResponse);

      await controller.createExercise(req, res);

      expect(mappers.toCreateExerciseCommand).toHaveBeenCalledWith({
        ...req.body,
        created_by: 5,
        createdBy: 5
      });
      expect(service.createExercise).toHaveBeenCalledWith(mockCommand);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Ejercicio creado con éxito',
        data: mockResponse
      });
    });

    it('should handle creation errors', async () => {
      const req = { user: { id_user_profile: 5 }, body: {} };
      const res = createRes();

      mappers.toCreateExerciseCommand.mockReturnValue({});
      service.createExercise.mockRejectedValue(new Error('Validation error'));

      await controller.createExercise(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'CREATE_EXERCISE_FAILED',
          message: 'Validation error'
        }
      });
    });
  });

  describe('updateExercise', () => {
    it('should update exercise', async () => {
      const req = {
        params: { id: '1' },
        body: { exercise_name: 'Press de banca modificado' }
      };
      const res = createRes();

      const mockCommand = { idExercise: 1, exerciseName: 'Press de banca modificado' };
      const mockExercise = { id_exercise: 1, exercise_name: 'Press de banca modificado' };
      const mockResponse = { id_exercise: 1, exercise_name: 'Press de banca modificado' };

      mappers.toUpdateExerciseCommand.mockReturnValue(mockCommand);
      service.updateExercise.mockResolvedValue(mockExercise);
      mappers.toExerciseResponse.mockReturnValue(mockResponse);

      await controller.updateExercise(req, res);

      expect(mappers.toUpdateExerciseCommand).toHaveBeenCalledWith(req.body, 1);
      expect(service.updateExercise).toHaveBeenCalledWith(mockCommand);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Ejercicio actualizado con éxito',
        data: mockResponse
      });
    });

    it('should return 404 when exercise not found', async () => {
      const req = { params: { id: '999' }, body: {} };
      const res = createRes();

      const NotFoundError = require('../utils/errors').NotFoundError;
      mappers.toUpdateExerciseCommand.mockReturnValue({ idExercise: 999 });
      service.updateExercise.mockRejectedValue(new NotFoundError('Ejercicio'));

      await controller.updateExercise(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.status).toHaveBeenCalledWith(404);
      const call = res.json.mock.calls[0][0];
      expect(call.error.code).toBe('EXERCISE_NOT_FOUND');
    });
  });
});
