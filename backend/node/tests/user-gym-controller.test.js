jest.mock('../services/user-gym-service');

const controller = require('../controllers/user-gym-controller');
const service = require('../services/user-gym-service');

const createRes = () => ({
  json: jest.fn(),
  status: jest.fn().mockReturnThis()
});

beforeEach(() => { jest.clearAllMocks(); });

describe('darAltaEnGimnasio', () => {
  it('validates required fields', async () => {
    const req = { user:{ id_user_profile:1 }, body:{} };
    const res = createRes();

    await controller.darAltaEnGimnasio(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(service.darAltaEnGimnasio).not.toHaveBeenCalled();
  });

  it('normalizes plan and returns structured response', async () => {
    const req = { user:{ id_user_profile:1 }, body:{ id_gym:2, plan:'mensual' } };
    const res = createRes();
    const alta = { id_user_gym: 5 };
    service.darAltaEnGimnasio.mockResolvedValue(alta);

    await controller.darAltaEnGimnasio(req, res);

    expect(service.darAltaEnGimnasio).toHaveBeenCalledWith({ id_user:1, id_gym:2, plan:'MENSUAL' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Alta en gimnasio realizada con éxito',
      data: alta
    });
  });
});

describe('obtenerGimnasiosActivos', () => {
  it('retorna gimnasios en formato estandarizado', async () => {
    const req = { user:{ id_user_profile:1 } };
    const res = createRes();
    service.obtenerGimnasiosActivos.mockResolvedValue(['g']);

    await controller.obtenerGimnasiosActivos(req, res);

    expect(service.obtenerGimnasiosActivos).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Gimnasios activos obtenidos con éxito',
      data: ['g']
    });
  });
});
