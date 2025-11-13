jest.mock('../services/assistance-service');

const controller = require('../controllers/assistance-controller');
const service = require('../services/assistance-service');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('registrarAsistencia', () => {
  it('returns 201 on success', async () => {
    const req = { 
      body: { id_gym:1, latitude:0, longitude:0 },
      user: { id_user_profile: 1 }
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.registrarAsistencia.mockResolvedValue({ asistencia: {}, distancia: 50, tokens_actuales: 100 });

    await controller.registrarAsistencia(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ 
      message: 'Asistencia registrada con éxito', 
      data: { asistencia: {}, distancia: 50, tokens_actuales: 100 }
    });
  });

  it('returns 400 when missing data', async () => {
    const req = { 
      body: {},
      user: { id_user_profile: 1 }
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.registrarAsistencia(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      error: { 
        code: 'MISSING_FIELDS', 
        message: 'Faltan datos requeridos: id_gym, latitude, longitude' 
      } 
    });
    expect(service.registrarAsistencia).not.toHaveBeenCalled();
  });
});

describe('obtenerHistorialAsistencias', () => {
  it('returns history', async () => {
    const req = { user: { id_user_profile: 2 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerHistorialAsistencias.mockResolvedValue(['a']);

    await controller.obtenerHistorialAsistencias(req, res);

    expect(service.obtenerHistorialAsistencias).toHaveBeenCalledWith(2);
    expect(res.json).toHaveBeenCalledWith({ message: 'Historial de asistencias obtenido con éxito', data: ['a'] });
  });

  it('handles errors', async () => {
    const req = { user: { id_user_profile: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerHistorialAsistencias.mockRejectedValue(new Error('x'));

    await controller.obtenerHistorialAsistencias(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      error: { 
        code: 'GET_ASSISTANCE_HISTORY_FAILED', 
        message: 'x' 
      } 
    });
  });
});