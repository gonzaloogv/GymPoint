jest.mock('../services/routine-service');
jest.mock('../services/user-routine-service');

const controller = require('../controllers/routine-controller');
const service = require('../services/routine-service');
const userRoutineService = require('../services/user-routine-service');

const createRes = () => ({
  json: jest.fn(),
  status: jest.fn().mockReturnThis(),
  send: jest.fn()
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getRoutineWithExercises', () => {
  it('retorna rutina con mensaje', async () => {
    const req = { params: { id: 1 } };
    const res = createRes();
    const rutina = { id: 1 };
    service.getRoutineWithExercises.mockResolvedValue(rutina);

    await controller.getRoutineWithExercises(req, res);

    expect(service.getRoutineWithExercises).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Rutina obtenida con éxito',
      data: rutina
    });
  });

  it('maneja errores devolviendo estructura de error', async () => {
    const req = { params: { id: 1 } };
    const res = createRes();
    service.getRoutineWithExercises.mockRejectedValue(new Error('no'));

    await controller.getRoutineWithExercises(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'ROUTINE_NOT_FOUND',
        message: 'no'
      }
    });
  });
});

describe('createRoutineWithExercises', () => {
  it('valida campos requeridos', async () => {
    const req = { user: { id_user_profile: 1 }, body: {} };
    const res = createRes();

    await controller.createRoutineWithExercises(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(service.createRoutineWithExercises).not.toHaveBeenCalled();
  });

  it('valida cantidad mínima de ejercicios', async () => {
    const req = {
      user: { id_user_profile: 1 },
      body: { routine_name: 'n', exercises: [{}, {}] }
    };
    const res = createRes();

    await controller.createRoutineWithExercises(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INVALID_EXERCISES',
        message: 'La rutina debe tener al menos 3 ejercicios'
      }
    });
    expect(service.createRoutineWithExercises).not.toHaveBeenCalled();
  });

  it('crea rutina enviando id_user correcto', async () => {
    const req = {
      user: { id_user_profile: 1 },
      body: { routine_name: 'n', description: 'd', exercises: [{}, {}, {}] }
    };
    const res = createRes();
    const rutina = { id: 10 };
    service.createRoutineWithExercises.mockResolvedValue(rutina);

    await controller.createRoutineWithExercises(req, res);

    expect(service.createRoutineWithExercises).toHaveBeenCalledWith({
      routine_name: 'n',
      description: 'd',
      exercises: [{}, {}, {}],
      id_user: 1
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Rutina creada con éxito',
      data: rutina
    });
  });
});

describe('updateRoutine', () => {
  it('envuelve la respuesta en objeto con mensaje', async () => {
    const req = { params: { id: 1 }, body: {} };
    const res = createRes();
    const updated = { id: 1 };
    service.updateRoutine.mockResolvedValue(updated);

    await controller.updateRoutine(req, res);

    expect(service.updateRoutine).toHaveBeenCalledWith(1, {});
    expect(res.json).toHaveBeenCalledWith({
      message: 'Rutina actualizada con éxito',
      data: updated
    });
  });
});

describe('deleteRoutine', () => {
  it('borra rutina y retorna 204', async () => {
    const req = { params: { id: 1 } };
    const res = createRes();

    await controller.deleteRoutine(req, res);

    expect(service.deleteRoutine).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});

describe('getRoutinesByUser', () => {
  it('usa id_user_profile del token', async () => {
    const req = { user: { id_user_profile: 1 } };
    const res = createRes();
    const routines = ['r'];
    service.getRoutinesByUser.mockResolvedValue(routines);

    await controller.getRoutinesByUser(req, res);

    expect(service.getRoutinesByUser).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Rutinas del usuario obtenidas con éxito',
      data: routines
    });
  });
});

describe('getActiveRoutineWithExercises', () => {
  it('retorna rutina activa con mensaje', async () => {
    const req = { params: { id_user: 1 } };
    const res = createRes();
    const routine = { id: 2 };
    userRoutineService.getActiveRoutineWithExercises.mockResolvedValue(routine);

    await controller.getActiveRoutineWithExercises(req, res);

    expect(userRoutineService.getActiveRoutineWithExercises).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Rutina activa obtenida con éxito',
      data: routine
    });
  });
});
