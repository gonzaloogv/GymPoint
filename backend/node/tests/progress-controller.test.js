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

beforeEach(() => { jest.clearAllMocks(); });

describe('registrarProgreso', () => {
  it('creates progress', async () => {
    const req = { user:{ id:1 }, body:{} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.registrarProgreso.mockResolvedValue('p');

    await controller.registrarProgreso(req, res);

    expect(service.registrarProgreso).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('p');
  });

  it('handles errors', async () => {
    const req = { user:{ id:1 }, body:{} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.registrarProgreso.mockRejectedValue(new Error('e'));

    await controller.registrarProgreso(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'e' });
  });
});

describe('obtenerProgresoPorUsuario', () => {
  it('returns list', async () => {
    const req = { user:{ id:1 } }; const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerProgresoPorUsuario.mockResolvedValue(['p']);

    await controller.obtenerProgresoPorUsuario(req, res);

    expect(service.obtenerProgresoPorUsuario).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(['p']);
  });
});

describe('obtenerEstadisticaPeso', () => {
  it('returns data', async () => {
    const req = { user:{ id:1 } }; const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerEstadisticaPeso.mockResolvedValue('d');

    await controller.obtenerEstadisticaPeso(req, res);

    expect(service.obtenerEstadisticaPeso).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith('d');
  });
});

describe('obtenerHistorialEjercicios', () => {
  it('returns data', async () => {
    const req = { user:{ id:1 } }; const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerHistorialEjercicios.mockResolvedValue(['d']);

    await controller.obtenerHistorialEjercicios(req, res);

    expect(service.obtenerHistorialEjercicios).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(['d']);
  });
});

describe('obtenerHistorialPorEjercicio', () => {
  it('returns data', async () => {
    const req = { user:{ id:1 }, params:{ id_exercise:2 } }; const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerHistorialPorEjercicio.mockResolvedValue(['d']);

    await controller.obtenerHistorialPorEjercicio(req, res);

    expect(service.obtenerHistorialPorEjercicio).toHaveBeenCalledWith(1, 2);
    expect(res.json).toHaveBeenCalledWith(['d']);
  });
});

describe('obtenerMejorLevantamiento', () => {
  it('returns best', async () => {
    const req = { user:{ id:1 }, params:{ id_exercise:2 } }; const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerMejorLevantamiento.mockResolvedValue('m');

    await controller.obtenerMejorLevantamiento(req, res);

    expect(service.obtenerMejorLevantamiento).toHaveBeenCalledWith(1,2);
    expect(res.json).toHaveBeenCalledWith('m');
  });

  it('404 when none', async () => {
    const req = { user:{ id:1 }, params:{ id_exercise:2 } }; const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerMejorLevantamiento.mockResolvedValue(null);

    await controller.obtenerMejorLevantamiento(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'No se encontraron registros' });
  });
});

describe('obtenerPromedioLevantamiento', () => {
  it('returns average', async () => {
    const req = { user:{ id:1 }, params:{ id_exercise:2 } }; const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerPromedioLevantamiento.mockResolvedValue('a');

    await controller.obtenerPromedioLevantamiento(req, res);

    expect(service.obtenerPromedioLevantamiento).toHaveBeenCalledWith(1,2);
    expect(res.json).toHaveBeenCalledWith('a');
  });

  it('404 when none', async () => {
    const req = { user:{ id:1 }, params:{ id_exercise:2 } }; const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerPromedioLevantamiento.mockResolvedValue(null);

    await controller.obtenerPromedioLevantamiento(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'No se encontraron registros' });
  });
});