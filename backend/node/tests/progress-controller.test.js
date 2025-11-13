jest.mock('../services/progress-service', () => ({
  registrarProgreso: jest.fn(),
  obtenerProgresoPorUsuario: jest.fn(),
  obtenerEstadisticaPeso: jest.fn(),
  obtenerHistorialEjercicios: jest.fn(),
  obtenerHistorialPorEjercicio: jest.fn(),
  obtenerMejorLevantamiento: jest.fn(),
  obtenerPromedioLevantamiento: jest.fn()
}));

const controller = require('../controllers/progress-controller');
const service = require('../services/progress-service');

const createRes = () => ({
  json: jest.fn(),
  status: jest.fn().mockReturnThis()
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('registrarProgreso', () => {
  it('envía el payload correcto y retorna respuesta 201', async () => {
    const req = {
      user: { id_user_profile: 1 },
      body: { date: '2024-01-01', body_weight: 80, body_fat: 20, ejercicios: [] }
    };
    const res = createRes();
    const stored = { id_progress: 10 };
    service.registrarProgreso.mockResolvedValue(stored);

    await controller.registrarProgreso(req, res);

    expect(service.registrarProgreso).toHaveBeenCalledWith({
      id_user: 1,
      date: '2024-01-01',
      body_weight: 80,
      body_fat: 20,
      ejercicios: []
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Progreso registrado con éxito',
      data: stored
    });
  });

  it('maneja errores devolviendo código 400', async () => {
    const req = { user: { id_user_profile: 1 }, body: {} };
    const res = createRes();
    service.registrarProgreso.mockRejectedValue(new Error('e'));

    await controller.registrarProgreso(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'REGISTER_PROGRESS_FAILED',
        message: 'e'
      }
    });
  });
});

describe('obtenerProgresoPorUsuario', () => {
  it('usa el id del perfil y retorna estructura con mensaje', async () => {
    const req = { user: { id_user_profile: 1 } };
    const res = createRes();
    const list = ['p'];
    service.obtenerProgresoPorUsuario.mockResolvedValue(list);

    await controller.obtenerProgresoPorUsuario(req, res);

    expect(service.obtenerProgresoPorUsuario).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Progreso obtenido con éxito',
      data: list
    });
  });
});

describe('obtenerEstadisticaPeso', () => {
  it('retorna estadísticas envueltas en objeto', async () => {
    const req = { user: { id_user_profile: 1 } };
    const res = createRes();
    const stats = { avg: 75 };
    service.obtenerEstadisticaPeso.mockResolvedValue(stats);

    await controller.obtenerEstadisticaPeso(req, res);

    expect(service.obtenerEstadisticaPeso).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Estadísticas de peso obtenidas con éxito',
      data: stats
    });
  });
});

describe('obtenerHistorialEjercicios', () => {
  it('retorna historial envuelto en objeto', async () => {
    const req = { user: { id_user_profile: 1 } };
    const res = createRes();
    const history = ['d'];
    service.obtenerHistorialEjercicios.mockResolvedValue(history);

    await controller.obtenerHistorialEjercicios(req, res);

    expect(service.obtenerHistorialEjercicios).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Historial de ejercicios obtenido con éxito',
      data: history
    });
  });
});

describe('obtenerHistorialPorEjercicio', () => {
  it('pasa id de usuario y ejercicio', async () => {
    const req = { user: { id_user_profile: 1 }, params: { id_exercise: 2 } };
    const res = createRes();
    const history = ['d'];
    service.obtenerHistorialPorEjercicio.mockResolvedValue(history);

    await controller.obtenerHistorialPorEjercicio(req, res);

    expect(service.obtenerHistorialPorEjercicio).toHaveBeenCalledWith(1, 2);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Historial del ejercicio obtenido con éxito',
      data: history
    });
  });
});

describe('obtenerMejorLevantamiento', () => {
  it('retorna mejor levantamiento envuelto en objeto', async () => {
    const req = { user: { id_user_profile: 1 }, params: { id_exercise: 2 } };
    const res = createRes();
    const best = { weight: 100 };
    service.obtenerMejorLevantamiento.mockResolvedValue(best);

    await controller.obtenerMejorLevantamiento(req, res);

    expect(service.obtenerMejorLevantamiento).toHaveBeenCalledWith(1, 2);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Mejor levantamiento obtenido con éxito',
      data: best
    });
  });

  it('retorna 404 cuando no hay registros', async () => {
    const req = { user: { id_user_profile: 1 }, params: { id_exercise: 2 } };
    const res = createRes();
    service.obtenerMejorLevantamiento.mockResolvedValue(null);

    await controller.obtenerMejorLevantamiento(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'NO_RECORDS_FOUND',
        message: 'No se encontraron registros para este ejercicio'
      }
    });
  });
});

describe('obtenerPromedioLevantamiento', () => {
  it('retorna promedio envuelto en objeto', async () => {
    const req = { user: { id_user_profile: 1 }, params: { id_exercise: 2 } };
    const res = createRes();
    const avg = { weight: 80 };
    service.obtenerPromedioLevantamiento.mockResolvedValue(avg);

    await controller.obtenerPromedioLevantamiento(req, res);

    expect(service.obtenerPromedioLevantamiento).toHaveBeenCalledWith(1, 2);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Promedio de levantamiento obtenido con éxito',
      data: avg
    });
  });

  it('retorna 404 cuando no hay datos', async () => {
    const req = { user: { id_user_profile: 1 }, params: { id_exercise: 2 } };
    const res = createRes();
    service.obtenerPromedioLevantamiento.mockResolvedValue(null);

    await controller.obtenerPromedioLevantamiento(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'NO_RECORDS_FOUND',
        message: 'No se encontraron registros para este ejercicio'
      }
    });
  });
});
