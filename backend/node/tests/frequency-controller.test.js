jest.mock('../services/frequency-service');

const controller = require('../controllers/frequency-controller');
const service = require('../services/frequency-service');

beforeEach(() => { jest.clearAllMocks(); });

describe('crearMeta', () => {
  it('creates weekly goal', async () => {
    const req = { user:{ id_user_profile:1 }, body:{ goal:3 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.crearMetaSemanal.mockResolvedValue('m');

    await controller.crearMeta(req, res);

    expect(service.crearMetaSemanal).toHaveBeenCalledWith({ id_user:1, goal:3 });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('m');
  });

  it('returns 400 when missing goal', async () => {
    const req = { user:{ id_user_profile:1 }, body:{} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.crearMeta(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'MISSING_GOAL',
        message: 'Falta la meta semanal.'
      }
    });
  });
});

describe('consultarMetaSemanal', () => {
  it('returns goal', async () => {
    const req = { user:{ id_user_profile:1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.consultarMetaSemanal.mockResolvedValue('g');

    await controller.consultarMetaSemanal(req, res);

    expect(service.consultarMetaSemanal).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith('g');
  });

  it('handles errors', async () => {
    const req = { user:{ id_user_profile:1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.consultarMetaSemanal.mockRejectedValue(new Error('x'));

    await controller.consultarMetaSemanal(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'FREQUENCY_NOT_FOUND',
        message: 'x'
      }
    });
  });
});

describe('reiniciarSemana', () => {
  it('calls service and returns message', async () => {
    const req = {}; const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.reiniciarSemana.mockResolvedValue();

    await controller.reiniciarSemana(req, res);

    expect(service.reiniciarSemana).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Frecuencias reiniciadas con éxito' });
  });

  it('handles errors', async () => {
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.reiniciarSemana.mockRejectedValue(new Error('err'));

    await controller.reiniciarSemana({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'RESET_FAILED',
        message: 'err'
      }
    });
  });
});
