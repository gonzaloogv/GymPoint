jest.mock('../models/Transaction', () => ({ findAll: jest.fn() }));
jest.mock('../models/Reward', () => ({}));

const service = require('../services/transaction-service');
const {Transaction} = require('../models');

beforeEach(() => { jest.clearAllMocks(); });

describe('obtenerTransaccionesPorUsuario', () => {
  it('calls findAll with user id', async () => {
    Transaction.findAll.mockResolvedValue([]);
    const res = await service.obtenerTransaccionesPorUsuario(1);
    expect(Transaction.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { id_user: 1 } }));
    expect(res).toEqual([]);
  });
});