jest.mock('../services/user-routine-service');

const controller = require('../controllers/user-routine-controller');
const service = require('../services/user-routine-service');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('assignRoutineToUser', () => {
  it('assigns routine', async () => {
    const req = { user: { id: 1 }, body: { id_routine: 2, start_date: 'd' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.assignRoutineToUser.mockResolvedValue('r');

    await controller.assignRoutineToUser(req, res);

    expect(service.assignRoutineToUser).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('r');
  });
});

describe('getActiveRoutine', () => {
  it('returns routine', async () => {
    const req = { user: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.getActiveRoutine.mockResolvedValue('r');

    await controller.getActiveRoutine(req, res);

    expect(service.getActiveRoutine).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith('r');
  });
});

describe('endUserRoutine', () => {
  it('ends routine', async () => {
    const req = { user: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.endUserRoutine.mockResolvedValue('r');

    await controller.endUserRoutine(req, res);

    expect(service.endUserRoutine).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith('r');
  });
});

describe('getActiveRoutineWithExercises', () => {
  it('returns routine', async () => {
    const req = { user: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.getActiveRoutineWithExercises.mockResolvedValue('r');

    await controller.getActiveRoutineWithExercises(req, res);

    expect(service.getActiveRoutineWithExercises).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith('r');
  });
});
