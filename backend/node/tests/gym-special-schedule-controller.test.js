jest.mock('../services/gym-special-schedule-service');

const controller = require('../controllers/gym-special-schedule-controller');
const service = require('../services/gym-special-schedule-service');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('crearHorarioEspecial', () => {
  it('validates body', async () => {
    const req = { body: {} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.crearHorarioEspecial(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(service.crearHorarioEspecial).not.toHaveBeenCalled();
  });

  it('creates special schedule', async () => {
    const req = {
      body: {
        id_gym: 1,
        date: 'd',
        opening_time: '',
        closing_time: '',
        closed: false,
        motive: 'x',
      },
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.crearHorarioEspecial.mockResolvedValue('h');

    await controller.crearHorarioEspecial(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('h');
  });
});

describe('obtenerHorariosEspecialesPorGimnasio', () => {
  it('returns list', async () => {
    const req = { params: { id_gym: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerHorariosEspecialesPorGimnasio.mockResolvedValue(['h']);

    await controller.obtenerHorariosEspecialesPorGimnasio(req, res);

    expect(service.obtenerHorariosEspecialesPorGimnasio).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(['h']);
  });
});
