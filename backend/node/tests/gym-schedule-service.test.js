jest.mock('../models/GymPayment', () => ({ create: jest.fn(), findAll: jest.fn(), findByPk: jest.fn() }));
jest.mock('../models/User', () => ({}));

const service = require('../services/gym-payment-service');
const GymPayment = require('../models/GymPayment');

beforeEach(() => { jest.clearAllMocks(); });

describe('registrarPago', () => {
  it('creates payment', async () => {
    GymPayment.create.mockResolvedValue('ok');
    const res = await service.registrarPago({ id_user:1,id_gym:1,mount:10,payment_method:'cash',payment_date:new Date(),status:'OK' });
    expect(GymPayment.create).toHaveBeenCalled();
    expect(res).toBe('ok');
  });
});

describe('actualizarEstadoPago', () => {
  it('throws when not found', async () => {
    GymPayment.findByPk.mockResolvedValue(null);
    await expect(service.actualizarEstadoPago(1,'ok')).rejects.toThrow('Pago no encontrado.');
  });
});