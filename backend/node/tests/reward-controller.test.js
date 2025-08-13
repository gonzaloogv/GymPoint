jest.mock('../services/reward-service');

const controller = require('../controllers/reward-controller');
const service = require('../services/reward-service');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('listarRecompensas', () => {
  it('returns rewards', async () => {
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.listarRecompensas.mockResolvedValue(['r']);

    await controller.listarRecompensas({}, res);

    expect(res.json).toHaveBeenCalledWith(['r']);
  });
});

describe('canjearRecompensa', () => {
  it('validates body', async () => {
    const req = { user: { id: 1 }, body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.canjearRecompensa(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(service.canjearRecompensa).not.toHaveBeenCalled();
  });

  it('redeems reward', async () => {
    const req = { user: { id: 1 }, body: { id_reward: 2, id_gym: 3 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.canjearRecompensa.mockResolvedValue('r');

    await controller.canjearRecompensa(req, res);

    expect(service.canjearRecompensa).toHaveBeenCalledWith({ id_user: 1, id_reward: 2, id_gym: 3 });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('r');
  });
});

describe('obtenerHistorialRecompensas', () => {
  it('returns history', async () => {
    const req = { user: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerHistorialRecompensas.mockResolvedValue(['h']);

    await controller.obtenerHistorialRecompensas(req, res);

    expect(service.obtenerHistorialRecompensas).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(['h']);
  });
});

describe('obtenerEstadisticasDeRecompensas', () => {
  it('returns stats', async () => {
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerEstadisticasDeRecompensas.mockResolvedValue('s');

    await controller.obtenerEstadisticasDeRecompensas({}, res);

    expect(res.json).toHaveBeenCalledWith('s');
  });
});

describe('crearRecompensa', () => {
  it('validates body', async () => {
    const req = { body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.crearRecompensa(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(service.crearRecompensa).not.toHaveBeenCalled();
  });

  it('creates reward', async () => {
    const body = {
      name: 'n',
      description: 'd',
      cost_tokens: 1,
      type: 't',
      stock: 1,
      start_date: 's',
      finish_date: 'f',
    };
    const req = { body };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.crearRecompensa.mockResolvedValue('r');

    await controller.crearRecompensa(req, res);

    expect(service.crearRecompensa).toHaveBeenCalledWith(body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('r');
  });
});
