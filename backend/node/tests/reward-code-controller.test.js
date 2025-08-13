jest.mock('../services/reward-code-service');

const controller = require('../controllers/reward-code-controller');
const service = require('../services/reward-code-service');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('obtenerCodigosPorUsuario', () => {
  it('returns codes', async () => {
    const req = { user: { id: 1 }, query: { used: 'false' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerCodigosPorUsuario.mockResolvedValue(['c']);

    await controller.obtenerCodigosPorUsuario(req, res);

    expect(service.obtenerCodigosPorUsuario).toHaveBeenCalledWith(1, 'false');
    expect(res.json).toHaveBeenCalledWith(['c']);
  });
});

describe('marcarComoUsado', () => {
  it('marks code', async () => {
    const req = { params: { id_code: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.marcarComoUsado.mockResolvedValue('c');

    await controller.marcarComoUsado(req, res);

    expect(service.marcarComoUsado).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Código marcado como usado', codigo: 'c' });
  });
});

describe('obtenerEstadisticasPorGimnasio', () => {
  it('returns stats', async () => {
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerEstadisticasPorGimnasio.mockResolvedValue('s');

    await controller.obtenerEstadisticasPorGimnasio({}, res);

    expect(res.json).toHaveBeenCalledWith('s');
  });
});

describe('obtenerCodigosActivos', () => {
  it('returns codes', async () => {
    const req = { user: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerCodigosActivos.mockResolvedValue(['c']);

    await controller.obtenerCodigosActivos(req, res);

    expect(service.obtenerCodigosActivos).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(['c']);
  });
});

describe('obtenerCodigosExpirados', () => {
  it('returns codes', async () => {
    const req = { user: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerCodigosExpirados.mockResolvedValue(['c']);

    await controller.obtenerCodigosExpirados(req, res);

    expect(service.obtenerCodigosExpirados).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(['c']);
  });
});
