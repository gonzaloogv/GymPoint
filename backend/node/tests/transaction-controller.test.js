jest.mock('../services/transaction-service');

const controller = require('../controllers/transaction-controller');
const service = require('../services/transaction-service');

beforeEach(() => { jest.clearAllMocks(); });

describe('obtenerTransaccionesPorUsuario', () => {
  it('returns list', async () => {
    const req = { params:{ id_user:1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerTransaccionesPorUsuario.mockResolvedValue(['t']);

    await controller.obtenerTransaccionesPorUsuario(req, res);

    expect(service.obtenerTransaccionesPorUsuario).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(['t']);
  });
});

describe('obtenerTransaccionesAutenticado', () => {
  it('returns list', async () => {
    const req = { user:{ id:2 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerTransaccionesPorUsuario.mockResolvedValue(['t']);

    await controller.obtenerTransaccionesAutenticado(req, res);

    expect(service.obtenerTransaccionesPorUsuario).toHaveBeenCalledWith(2);
    expect(res.json).toHaveBeenCalledWith(['t']);
  });
});