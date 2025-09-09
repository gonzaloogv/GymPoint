jest.mock('../services/gym-payment-service');

const controller = require('../controllers/gym-payment-controller');
const service = require('../services/gym-payment-service');

beforeEach(() => { jest.clearAllMocks(); });

describe('registrarPago', () => {
  it('creates payment', async () => {
    const req = { user:{ id:1 }, body:{ id_gym:1,mount:10,payment_method:'cash',payment_date:'d',status:'OK' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.registrarPago.mockResolvedValue('p');

    await controller.registrarPago(req, res);

    expect(service.registrarPago).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith('p');
  });

  it('validates body fields', async () => {
    const req = { user:{ id:1 }, body:{} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.registrarPago(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(service.registrarPago).not.toHaveBeenCalled();
  });
});

describe('obtenerPagosPorUsuario', () => {
  it('returns list', async () => {
    const req = { user:{ id:1 } }; const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerPagosPorUsuario.mockResolvedValue(['p']);

    await controller.obtenerPagosPorUsuario(req, res);

    expect(service.obtenerPagosPorUsuario).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(['p']);
  });
});

describe('obtenerPagosPorGimnasio', () => {
  it('returns list', async () => {
    const req = { params:{ id_gym:1 } }; const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.obtenerPagosPorGimnasio.mockResolvedValue(['p']);

    await controller.obtenerPagosPorGimnasio(req, res);

    expect(service.obtenerPagosPorGimnasio).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(['p']);
  });
});

describe('actualizarEstadoPago', () => {
  it('requires status', async () => {
    const req = { params:{ id_payment:1 }, body:{} };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await controller.actualizarEstadoPago(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(service.actualizarEstadoPago).not.toHaveBeenCalled();
  });

  it('updates payment', async () => {
    const req = { params:{ id_payment:1 }, body:{ status:'OK' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    service.actualizarEstadoPago.mockResolvedValue('u');

    await controller.actualizarEstadoPago(req, res);

    expect(service.actualizarEstadoPago).toHaveBeenCalledWith(1, 'OK');
    expect(res.json).toHaveBeenCalledWith('u');
  });
});