jest.mock('../services/user-gym-service');

const controller = require('../controllers/user-gym-controller');
const service = require('../services/user-gym-service');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('darAltaEnGimnasio', () => {
  it('validates body', async () => {
    const req = { user: { id: 1 }, body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.darAltaEnGimnasio(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(service.darAltaEnGimnasio).not.toHaveBeenCalled();
  });

  it('registers', async () => {
    const req = { user: { id: 1 }, body: { id_gym: 2, plan: 'p' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.darAltaEnGimnasio.mockResolvedValue('a');

    await controller.darAltaEnGimnasio(req, res);

    expect(service.darAltaEnGimnasio).toHaveBeenCalledWith({ id_user: 1, id_gym: 2, plan: 'p' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('a');
  });
});

describe('darBajaEnGimnasio', () => {
  it('validates body', async () => {
    const req = { user: { id: 1 }, body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.darBajaEnGimnasio(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('obtenerGimnasiosActivos', () => {
  it('returns gyms', async () => {
    const req = { user: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerGimnasiosActivos.mockResolvedValue(['g']);

    await controller.obtenerGimnasiosActivos(req, res);

    expect(service.obtenerGimnasiosActivos).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(['g']);
  });
});

describe('contarUsuariosActivosEnGimnasio', () => {
  it('returns total', async () => {
    const req = { params: { id_gym: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.contarUsuariosActivosEnGimnasio.mockResolvedValue(5);

    await controller.contarUsuariosActivosEnGimnasio(req, res);

    expect(service.contarUsuariosActivosEnGimnasio).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({ id_gym: 1, usuarios_activos: 5 });
  });
});
