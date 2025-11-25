jest.mock('../services/transaction-service');

const controller = require('../controllers/transaction-controller');
const service = require('../services/transaction-service');

const createRes = () => ({
  json: jest.fn(),
  status: jest.fn().mockReturnThis()
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('obtenerTransaccionesPorUsuario', () => {
  it('retorna transacciones envueltas en objeto', async () => {
    const req = { params: { id_user: 1 } };
    const res = createRes();
    const transactions = ['t'];
    service.obtenerTransaccionesPorUsuario.mockResolvedValue(transactions);

    await controller.obtenerTransaccionesPorUsuario(req, res);

    expect(service.obtenerTransaccionesPorUsuario).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Transacciones obtenidas con éxito',
      data: transactions
    });
  });
});

describe('obtenerTransaccionesAutenticado', () => {
  it('usa id_user_profile del token', async () => {
    const req = { user: { id_user_profile: 2 } };
    const res = createRes();
    const transactions = ['t'];
    service.obtenerTransaccionesPorUsuario.mockResolvedValue(transactions);

    await controller.obtenerTransaccionesAutenticado(req, res);

    expect(service.obtenerTransaccionesPorUsuario).toHaveBeenCalledWith(2);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Transacciones obtenidas con éxito',
      data: transactions
    });
  });
});
