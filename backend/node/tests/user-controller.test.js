jest.mock('../services/user-service');

const controller = require('../controllers/user-controller');
const service = require('../services/user-service');

const createRes = () => ({
  json: jest.fn(),
  status: jest.fn().mockReturnThis()
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('actualizarPerfil', () => {
  it('requiere id_user_profile en el token', async () => {
    const req = { user: {} };
    const res = createRes();

    await controller.actualizarPerfil(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'USER_PROFILE_REQUIRED',
        message: 'Solo usuarios pueden actualizar perfil'
      }
    });
    expect(service.actualizarPerfil).not.toHaveBeenCalled();
  });

  it('actualiza perfil con id del perfil', async () => {
    const req = { user: { id_user_profile: 1 }, body: { name: 'n' } };
    const res = createRes();
    service.actualizarPerfil.mockResolvedValue('u');

    await controller.actualizarPerfil(req, res);

    expect(service.actualizarPerfil).toHaveBeenCalledWith(1, { name: 'n' });
    expect(res.json).toHaveBeenCalledWith('u');
  });

  it('maneja errores retornando estructura estandarizada', async () => {
    const req = { user: { id_user_profile: 1 }, body: {} };
    const res = createRes();
    service.actualizarPerfil.mockRejectedValue(new Error('e'));

    await controller.actualizarPerfil(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'UPDATE_FAILED',
        message: 'e'
      }
    });
  });
});

describe('obtenerPerfil', () => {
  it('retorna perfil del usuario autenticado', async () => {
    const req = { user: { id: 2 } };
    const res = createRes();
    service.obtenerUsuario.mockResolvedValue('u');

    await controller.obtenerPerfil(req, res);

    expect(service.obtenerUsuario).toHaveBeenCalledWith(2);
    expect(res.json).toHaveBeenCalledWith('u');
  });

  it('maneja errores devolviendo código 404', async () => {
    const req = { user: { id: 2 } };
    const res = createRes();
    service.obtenerUsuario.mockRejectedValue(new Error('not found'));

    await controller.obtenerPerfil(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'USER_NOT_FOUND',
        message: 'not found'
      }
    });
  });
});
