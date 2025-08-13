jest.mock('../services/exercise-service');

const controller = require('../controllers/exercise-controller');
const service = require('../services/exercise-service');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getAllExercises', () => {
  it('returns all exercises', async () => {
    const res = { json: jest.fn() };
    service.getAllExercises.mockResolvedValue(['a']);

    await controller.getAllExercises({}, res);

    expect(res.json).toHaveBeenCalledWith(['a']);
  });
});

describe('getExerciseById', () => {
  it('returns exercise', async () => {
    const req = { params: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.getExerciseById.mockResolvedValue('e');

    await controller.getExerciseById(req, res);

    expect(res.json).toHaveBeenCalledWith('e');
  });

  it('returns 404 when not found', async () => {
    const req = { params: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.getExerciseById.mockResolvedValue(null);

    await controller.getExerciseById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Ejercicio no encontrado' });
  });
});

describe('createExercise', () => {
  it('creates exercise', async () => {
    const req = { body: { a: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.createExercise.mockResolvedValue('x');

    await controller.createExercise(req, res);

    expect(service.createExercise).toHaveBeenCalledWith({ a: 1 });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('x');
  });
});

describe('updateExercise', () => {
  it('updates exercise', async () => {
    const req = { params: { id: 1 }, body: { a: 2 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.updateExercise.mockResolvedValue('u');

    await controller.updateExercise(req, res);

    expect(service.updateExercise).toHaveBeenCalledWith(1, { a: 2 });
    expect(res.json).toHaveBeenCalledWith('u');
  });

  it('returns 404 on error', async () => {
    const req = { params: { id: 1 }, body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.updateExercise.mockRejectedValue(new Error('no'));

    await controller.updateExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'no' });
  });
});

describe('deleteExercise', () => {
  it('deletes exercise', async () => {
    const req = { params: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };
    service.deleteExercise.mockResolvedValue();

    await controller.deleteExercise(req, res);

    expect(service.deleteExercise).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('returns 404 on error', async () => {
    const req = { params: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
    service.deleteExercise.mockRejectedValue(new Error('fail'));

    await controller.deleteExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
  });
});
