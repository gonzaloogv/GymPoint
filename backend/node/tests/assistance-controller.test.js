jest.mock('../services/assistance-service');

const controller = require('../controllers/assistance-controller');
const service = require('../services/assistance-service');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('registrarAsistencia', () => {
  it('returns 201 on success', async () => {
    const req = { body: { id_user:1,id_gym:1,latitude:0,longitude:0 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.registrarAsistencia.mockResolvedValue('ok');

    await controller.registrarAsistencia(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('ok');
  });

  it('returns 400 when missing data', async () => {
    const req = { body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.registrarAsistencia(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Faltan datos requeridos.' });
    expect(service.registrarAsistencia).not.toHaveBeenCalled();
  });
});

describe('obtenerHistorialAsistencias', () => {
  it('returns history', async () => {
    const req = { user: { id: 2 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerHistorialAsistencias.mockResolvedValue(['a']);

    await controller.obtenerHistorialAsistencias(req, res);

    expect(service.obtenerHistorialAsistencias).toHaveBeenCalledWith(2);
    expect(res.json).toHaveBeenCalledWith(['a']);
  });

  it('handles errors', async () => {
    const req = { user: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerHistorialAsistencias.mockRejectedValue(new Error('x'));

    await controller.obtenerHistorialAsistencias(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'x' });
  });
});