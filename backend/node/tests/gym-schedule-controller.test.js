jest.mock('../services/gym-schedule-service');

const controller = require('../controllers/gym-schedule-controller');
const service = require('../services/gym-schedule-service');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('crearHorario', () => {
  it('validates body', async () => {
    const req = { body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.crearHorario(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(service.crearHorario).not.toHaveBeenCalled();
  });

  it('creates schedule', async () => {
    const req = {
      body: { id_gym: 1, day_of_week: 1, opening_time: '', closing_time: '', closed: false },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.crearHorario.mockResolvedValue('h');

    await controller.crearHorario(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('h');
  });
});

describe('obtenerHorariosPorGimnasio', () => {
  it('returns list', async () => {
    const req = { params: { id_gym: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerHorariosPorGimnasio.mockResolvedValue(['h']);

    await controller.obtenerHorariosPorGimnasio(req, res);

    expect(service.obtenerHorariosPorGimnasio).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(['h']);
  });
});

describe('actualizarHorario', () => {
  it('updates schedule', async () => {
    const req = { params: { id_schedule: 1 }, body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.actualizarHorario.mockResolvedValue('u');

    await controller.actualizarHorario(req, res);

    expect(service.actualizarHorario).toHaveBeenCalledWith(1, {});
    expect(res.json).toHaveBeenCalledWith('u');
  });

  it('handles errors', async () => {
    const req = { params: { id_schedule: 1 }, body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.actualizarHorario.mockRejectedValue(new Error('err'));

    await controller.actualizarHorario(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'err' });
  });
});
