jest.mock('../services/gym-service');

const controller = require('../controllers/gym-controller');
const service = require('../services/gym-service');

beforeEach(() => { jest.clearAllMocks(); });

describe('getAllGyms', () => {
  it('returns list', async () => {
    const res = { json: jest.fn() };
    service.getAllGyms.mockResolvedValue(['g']);

    await controller.getAllGyms({}, res);

    expect(res.json).toHaveBeenCalledWith(['g']);
  });
});

describe('getGymById', () => {
  it('returns gym', async () => {
    const req = { params:{ id:1 } }; const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.getGymById.mockResolvedValue('g');

    await controller.getGymById(req, res);

    expect(res.json).toHaveBeenCalledWith('g');
  });

  it('404 when not found', async () => {
    const req = { params:{ id:1 } }; const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.getGymById.mockResolvedValue(null);

    await controller.getGymById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Gym no encontrado' });
  });
});

describe('createGym', () => {
  it('creates gym', async () => {
    const req = { body:{ a:1 } }; const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.createGym.mockResolvedValue('g');

    await controller.createGym(req, res);

    expect(service.createGym).toHaveBeenCalledWith({ a:1 });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('g');
  });
});

describe('updateGym', () => {
  it('updates gym', async () => {
    const req = { params:{ id:1 }, body:{} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.updateGym.mockResolvedValue('u');

    await controller.updateGym(req, res);

    expect(service.updateGym).toHaveBeenCalledWith(1, {});
    expect(res.json).toHaveBeenCalledWith('u');
  });

  it('handles errors', async () => {
    const req = { params:{ id:1 }, body:{} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.updateGym.mockRejectedValue(new Error('err'));

    await controller.updateGym(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'err' });
  });
});

describe('deleteGym', () => {
  it('deletes', async () => {
    const req = { params:{ id:1 } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn(), json: jest.fn() };
    await controller.deleteGym(req, res);

    expect(service.deleteGym).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('returns 404 on error', async () => {
    const req = { params:{ id:1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
    service.deleteGym.mockRejectedValue(new Error('fail'));

    await controller.deleteGym(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
  });
});

describe('buscarGimnasiosCercanos', () => {
  it('requires lat and lon', async () => {
    const req = { query:{} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.buscarGimnasiosCercanos(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Faltan parámetros lat y lon' });
  });

  it('returns gyms', async () => {
    const req = { query:{ lat:'0', lon:'0' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.buscarGimnasiosCercanos.mockResolvedValue(['g']);

    await controller.buscarGimnasiosCercanos(req, res);

    expect(service.buscarGimnasiosCercanos).toHaveBeenCalledWith(0, 0);
    expect(res.json).toHaveBeenCalledWith(['g']);
  });
});

describe('getGymsByCity', () => {
  it('requires city', async () => {
    const req = { query:{} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.getGymsByCity(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Parámetro city requerido' });
  });

  it('returns gyms', async () => {
    const req = { query:{ city:'a' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.getGymsByCity.mockResolvedValue(['g']);

    await controller.getGymsByCity(req, res);

    expect(service.getGymsByCity).toHaveBeenCalledWith('a');
    expect(res.json).toHaveBeenCalledWith(['g']);
  });
});

describe('filtrarGimnasios', () => {
  it('blocks type filter for non premium', async () => {
    const req = { user:{ id:1, rol:'FREE' }, query:{ type:'x' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.filtrarGimnasios(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Solo usuarios PREMIUM pueden filtrar por tipo de gimnasio.' });
  });

  it('calls service with params', async () => {
    const req = { user:{ id:1, rol:'PREMIUM' }, query:{ city:'a', type:'t', minPrice:'1', maxPrice:'2' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.filtrarGimnasios.mockResolvedValue({ resultados:['g'], advertencia:null });

    await controller.filtrarGimnasios(req, res);

    expect(service.filtrarGimnasios).toHaveBeenCalledWith({ id_user:1, city:'a', type:'t', minPrice:1, maxPrice:2 });
    expect(res.json).toHaveBeenCalledWith({ gimnasios:['g'], advertencia:null });
  });
});

describe('getGymTypes', () => {
  it('returns types', () => {
    const res = { json: jest.fn() };
    service.getGymTypes.mockReturnValue([1]);

    controller.getGymTypes({}, res);

    expect(res.json).toHaveBeenCalledWith([1]);
  });
});