jest.mock('../services/exercise-service');
jest.mock('../models/Exercise', () => ({ findByPk: jest.fn() }));

const controller = require('../controllers/exercise-controller');
const service = require('../services/exercise-service');
const Exercise = require('../models/Exercise');

const createRes = () => ({
  json: jest.fn(),
  status: jest.fn().mockReturnThis(),
  send: jest.fn()
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getAllExercises', () => {
  it('returns all exercises', async () => {
    const res = createRes();
    service.getAllExercises.mockResolvedValue(['a']);

    await controller.getAllExercises({}, res);

    expect(res.json).toHaveBeenCalledWith(['a']);
  });
});

describe('getExerciseById', () => {
  it('returns exercise', async () => {
    const req = { params: { id: 1 } };
    const res = createRes();
    service.getExerciseById.mockResolvedValue('e');

    await controller.getExerciseById(req, res);

    expect(res.json).toHaveBeenCalledWith('e');
  });

  it('returns 404 when not found', async () => {
    const req = { params: { id: 1 } };
    const res = createRes();
    service.getExerciseById.mockResolvedValue(null);

    await controller.getExerciseById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Ejercicio no encontrado' });
  });
});

describe('createExercise', () => {
  it('agrega created_by desde el usuario y retorna estructura con mensaje', async () => {
    const req = { user: { id_user_profile: 5 }, body: { a: 1 } };
    const res = createRes();
    service.createExercise.mockResolvedValue('x');

    await controller.createExercise(req, res);

    expect(service.createExercise).toHaveBeenCalledWith({ a: 1, created_by: 5 });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Ejercicio creado con éxito',
      data: 'x'
    });
  });
});

describe('updateExercise', () => {
  it('updates exercise', async () => {
    const req = { params: { id: 1 }, body: { a: 2 } };
    const res = createRes();
    service.updateExercise.mockResolvedValue('u');

    await controller.updateExercise(req, res);

    expect(service.updateExercise).toHaveBeenCalledWith(1, { a: 2 });
    expect(res.json).toHaveBeenCalledWith('u');
  });

  it('returns 404 on error', async () => {
    const req = { params: { id: 1 }, body: {} };
    const res = createRes();
    service.updateExercise.mockRejectedValue(new Error('no'));

    await controller.updateExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'no' });
  });
});

describe('deleteExercise', () => {
  it('verifica ownership y elimina ejercicio', async () => {
    const req = { params: { id: 1 }, user: { id_user_profile: 9 }, roles: [] };
    const res = createRes();
    Exercise.findByPk.mockResolvedValue({ created_by: 9 });

    await controller.deleteExercise(req, res);

    expect(Exercise.findByPk).toHaveBeenCalledWith(1);
    expect(service.deleteExercise).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('retorna 404 cuando no existe', async () => {
    const req = { params: { id: 1 } };
    const res = createRes();
    Exercise.findByPk.mockResolvedValue(null);

    await controller.deleteExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'EXERCISE_NOT_FOUND',
        message: 'Ejercicio no encontrado'
      }
    });
    expect(service.deleteExercise).not.toHaveBeenCalled();
  });

  it('bloquea borrado cuando no es propietario', async () => {
    const req = { params: { id: 1 }, user: { id_user_profile: 2 }, roles: [] };
    const res = createRes();
    Exercise.findByPk.mockResolvedValue({ created_by: 3 });

    await controller.deleteExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'FORBIDDEN',
        message: 'No eres el propietario de este ejercicio'
      }
    });
    expect(service.deleteExercise).not.toHaveBeenCalled();
  });
});
