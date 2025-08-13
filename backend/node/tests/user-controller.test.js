jest.mock('../services/user-service');

const controller = require('../controllers/user-controller');
const service = require('../services/user-service');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('actualizarPerfil', () => {
  it('updates profile', async () => {
    const req = { user: { id: 1 }, body: { name: 'n' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.actualizarPerfil.mockResolvedValue('u');

    await controller.actualizarPerfil(req, res);

    expect(service.actualizarPerfil).toHaveBeenCalledWith(1, { name: 'n' });
    expect(res.json).toHaveBeenCalledWith('u');
  });

  it('handles errors', async () => {
    const req = { user: { id: 1 }, body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.actualizarPerfil.mockRejectedValue(new Error('e'));

    await controller.actualizarPerfil(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'e' });
  });
});

describe('obtenerPerfil', () => {
  it('returns profile', async () => {
    const req = { user: { id: 2 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerUsuario.mockResolvedValue('u');

    await controller.obtenerPerfil(req, res);

    expect(service.obtenerUsuario).toHaveBeenCalledWith(2);
    expect(res.json).toHaveBeenCalledWith('u');
  });
});
