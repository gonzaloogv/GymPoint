jest.mock('../models/User', () => ({
  findByPk: jest.fn(),
}));

jest.mock('../models/Transaction', () => ({
  create: jest.fn(),
  findAll: jest.fn(),
}));

jest.mock('../models/ClaimedReward', () => ({
  count: jest.fn(),
}));

const tokenService = require('../services/token-service');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ClaimedReward = require('../models/ClaimedReward');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('otorgarTokens', () => {
  it('adds tokens and creates a transaction', async () => {
    const user = { tokens: 10, save: jest.fn() };
    User.findByPk.mockResolvedValue(user);
    Transaction.create.mockResolvedValue({});

    const result = await tokenService.otorgarTokens({ id_user: 1, amount: 5, motive: 'test' });

    expect(user.tokens).toBe(15);
    expect(user.save).toHaveBeenCalled();
    expect(Transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id_user: 1,
        amount: 5,
        motive: 'test',
        result_balance: 15,
      })
    );
    expect(result.tokens_actuales).toBe(15);
  });

  it('throws if user not found', async () => {
    User.findByPk.mockResolvedValue(null);
    await expect(
      tokenService.otorgarTokens({ id_user: 1, amount: 5, motive: 'test' })
    ).rejects.toThrow('Usuario no encontrado');
  });

  it('throws on invalid amount', async () => {
    User.findByPk.mockResolvedValue({ tokens: 0 });
    await expect(
      tokenService.otorgarTokens({ id_user: 1, amount: -1, motive: 'x' })
    ).rejects.toThrow('Monto de tokens inválido');
  });
});

describe('obtenerResumenTokens', () => {
  it('returns token summary', async () => {
    User.findByPk.mockResolvedValue({ tokens: 10 });
    Transaction.findAll.mockResolvedValue([
      { movement_type: 'GANANCIA', amount: 5 },
      { movement_type: 'GASTO', amount: 2 },
    ]);
    ClaimedReward.count.mockResolvedValue(1);

    const result = await tokenService.obtenerResumenTokens(1);

    expect(result).toEqual({
      id_user: 1,
      tokens_actuales: 10,
      total_ganados: 5,
      total_gastados: 2,
      canjes_realizados: 1,
    });
  });
});
