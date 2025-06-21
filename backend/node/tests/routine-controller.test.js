jest.mock('../services/routine-service');
jest.mock('../services/user-routine-service');

const controller = require('../controllers/routine-controller');
const service = require('../services/routine-service');
const userRoutineService = require('../services/user-routine-service');

beforeEach(() => { jest.clearAllMocks(); });

describe('getRoutineWithExercises', () => {
  it('returns routine', async () => {
    const req = { params:{ id:1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.getRoutineWithExercises.mockResolvedValue('r');

    await controller.getRoutineWithExercises(req, res);

    expect(service.getRoutineWithExercises).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith('r');
  });

  it('handles errors', async () => {
    const req = { params:{ id:1 } }; const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.getRoutineWithExercises.mockRejectedValue(new Error('no'));

    await controller.getRoutineWithExercises(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'no' });
  });
});

describe('createRoutineWithExercises', () => {
  it('validates body', async () => {
    const req = { user:{ id:1 }, body:{} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.createRoutineWithExercises(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(service.createRoutineWithExercises).not.toHaveBeenCalled();
  });

  it('creates routine', async () => {
    const req = { user:{ id:1 }, body:{ routine_name:'n', exercises:[] } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.createRoutineWithExercises.mockResolvedValue('r');

    await controller.createRoutineWithExercises(req, res);

    expect(service.createRoutineWithExercises).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('r');
  });
});

describe('updateRoutine', () => {
  it('updates routine', async () => {
    const req = { params:{ id:1 }, body:{} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.updateRoutine.mockResolvedValue('u');

    await controller.updateRoutine(req, res);

    expect(service.updateRoutine).toHaveBeenCalledWith(1, {});
    expect(res.json).toHaveBeenCalledWith('u');
  });
});

describe('deleteRoutine', () => {
  it('deletes', async () => {
    const req = { params:{ id:1 } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };
    service.deleteRoutine.mockResolvedValue();

    await controller.deleteRoutine(req, res);

    expect(service.deleteRoutine).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(204);
  });
});

describe('getRoutinesByUser', () => {
  it('returns list', async () => {
    const req = { user:{ id:1 } }; const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.getRoutinesByUser.mockResolvedValue(['r']);

    await controller.getRoutinesByUser(req, res);

    expect(service.getRoutinesByUser).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(['r']);
  });
});

describe('getActiveRoutineWithExercises', () => {
  it('returns active routine', async () => {
    const req = { params:{ id_user:1 } }; const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    userRoutineService.getActiveRoutineWithExercises.mockResolvedValue('r');

    await controller.getActiveRoutineWithExercises(req, res);

    expect(userRoutineService.getActiveRoutineWithExercises).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith('r');
  });
});