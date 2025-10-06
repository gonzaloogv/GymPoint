jest.mock('../services/gym-service');

const controller = require('../controllers/gym-controller');
const service = require('../services/gym-service');

const createRes = () => ({
  json: jest.fn(),
  status: jest.fn().mockReturnThis(),
  send: jest.fn()
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getAllGyms', () => {
  it('returns list', async () => {
    const res = createRes();
    service.getAllGyms.mockResolvedValue(['g']);

    await controller.getAllGyms({}, res);

    expect(res.json).toHaveBeenCalledWith(['g']);
  });
});

describe('getGymById', () => {
  it('returns gym', async () => {
    const req = { params: { id: 1 } };
    const res = createRes();
    service.getGymById.mockResolvedValue('g');

    await controller.getGymById(req, res);

    expect(res.json).toHaveBeenCalledWith('g');
  });

  it('404 when not found', async () => {
    const req = { params: { id: 1 } };
    const res = createRes();
    service.getGymById.mockResolvedValue(null);

    await controller.getGymById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Gym no encontrado' });
  });
});

describe('createGym', () => {
  it('creates gym', async () => {
    const req = { body: { a: 1 } };
    const res = createRes();
    service.createGym.mockResolvedValue('g');

    await controller.createGym(req, res);

    expect(service.createGym).toHaveBeenCalledWith({ a: 1 });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('g');
  });
});

describe('updateGym', () => {
  it('updates gym', async () => {
    const req = { params: { id: 1 }, body: {} };
    const res = createRes();
    service.updateGym.mockResolvedValue('u');

    await controller.updateGym(req, res);

    expect(service.updateGym).toHaveBeenCalledWith(1, {});
    expect(res.json).toHaveBeenCalledWith('u');
  });

  it('handles errors', async () => {
    const req = { params: { id: 1 }, body: {} };
    const res = createRes();
    service.updateGym.mockRejectedValue(new Error('err'));

    await controller.updateGym(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'err' });
  });
});

describe('deleteGym', () => {
  it('deletes', async () => {
    const req = { params: { id: 1 } };
    const res = createRes();

    await controller.deleteGym(req, res);

    expect(service.deleteGym).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('returns 404 on error', async () => {
    const req = { params: { id: 1 } };
    const res = createRes();
    service.deleteGym.mockRejectedValue(new Error('fail'));

    await controller.deleteGym(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
  });
});

describe('buscarGimnasiosCercanos', () => {
  it('requires lat and lon', async () => {
    const req = { query: {} };
    const res = createRes();

    await controller.buscarGimnasiosCercanos(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'MISSING_PARAMS',
        message: 'Parámetros requeridos: lat y lng (o lon)'
      }
    });
  });

  it('returns gyms with metadata', async () => {
    const req = { query: { lat: '0', lon: '0' } };
    const res = createRes();
    const gyms = ['g'];
    service.buscarGimnasiosCercanos.mockResolvedValue(gyms);

    await controller.buscarGimnasiosCercanos(req, res);

    expect(service.buscarGimnasiosCercanos).toHaveBeenCalledWith(0, 0, 5, 50, 0);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Gimnasios cercanos obtenidos con éxito',
      data: gyms,
      meta: {
        total: gyms.length,
        center: { lat: 0, lng: 0 },
        radius_km: 5
      }
    });
  });
});

describe('getGymsByCity', () => {
  it('requires city', async () => {
    const req = { query: {} };
    const res = createRes();

    await controller.getGymsByCity(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Parámetro city requerido' });
  });

  it('returns gyms', async () => {
    const req = { query: { city: 'a' } };
    const res = createRes();
    service.getGymsByCity.mockResolvedValue(['g']);

    await controller.getGymsByCity(req, res);

    expect(service.getGymsByCity).toHaveBeenCalledWith('a');
    expect(res.json).toHaveBeenCalledWith(['g']);
  });
});

describe('filtrarGimnasios', () => {
  it('blocks type filter for non premium', async () => {
    const req = { user: { id: 1, rol: 'FREE' }, query: { type: 'x' } };
    const res = createRes();

    await controller.filtrarGimnasios(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Solo usuarios PREMIUM pueden filtrar por tipo de gimnasio.'
    });
  });

  it('calls service with params', async () => {
    const req = {
      user: { id: 1, rol: 'PREMIUM' },
      query: { city: 'a', type: 't', minPrice: '1', maxPrice: '2' }
    };
    const res = createRes();
    service.filtrarGimnasios.mockResolvedValue({ resultados: ['g'], advertencia: null });

    await controller.filtrarGimnasios(req, res);

    expect(service.filtrarGimnasios).toHaveBeenCalledWith({
      id_user: 1,
      city: 'a',
      type: 't',
      minPrice: 1,
      maxPrice: 2
    });
    expect(res.json).toHaveBeenCalledWith({ gimnasios: ['g'], advertencia: null });
  });
});

describe('getGymTypes', () => {
  it('returns types', () => {
    const res = createRes();
    service.getGymTypes.mockReturnValue([1]);

    controller.getGymTypes({}, res);

    expect(res.json).toHaveBeenCalledWith([1]);
  });
});
