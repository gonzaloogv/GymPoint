jest.mock('../models', () => ({
  UserProfile: {}
}));

jest.mock('../services/token-ledger-service', () => ({
  registrarMovimiento: jest.fn(),
  obtenerEstadisticas: jest.fn()
}));

jest.mock('../models/ClaimedReward', () => ({
  count: jest.fn()
}));

const tokenService = require('../services/token-service');
const tokenLedgerService = require('../services/token-ledger-service');
const ClaimedReward = require('../models/ClaimedReward');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('otorgarTokens', () => {
  it('adds tokens using ledger service', async () => {
    tokenLedgerService.registrarMovimiento.mockResolvedValue({
      previousBalance: 10,
      newBalance: 15,
      ledgerEntry: {}
    });

    const result = await tokenService.otorgarTokens({ id_user: 1, amount: 5, motive: 'test' });

    expect(tokenLedgerService.registrarMovimiento).toHaveBeenCalledWith({
      userId: 1,
      delta: 5,
      reason: 'test',
      refType: null,
      refId: null
    });
    expect(result.tokens_antes).toBe(10);
    expect(result.tokens_actuales).toBe(15);
    expect(result.motive).toBe('test');
  });

  it('throws on invalid amount', async () => {
    await expect(tokenService.otorgarTokens({ id_user: 1, amount: -1, motive: 'x' }))
      .rejects.toThrow('Monto de tokens inválido');
  });

  it('throws on invalid amount (zero)', async () => {
    await expect(tokenService.otorgarTokens({ id_user: 1, amount: 0, motive: 'x' }))
      .rejects.toThrow('Monto de tokens inválido');
  });
});

describe('obtenerResumenTokens', () => {
  it('returns token summary from ledger stats', async () => {
    tokenLedgerService.obtenerEstadisticas.mockResolvedValue({
      balance_actual: 10,
      total_ganado: 50,
      total_gastado: 40,
      total_movimientos: 15
    });
    ClaimedReward.count.mockResolvedValue(3);

    const result = await tokenService.obtenerResumenTokens(1);

    expect(tokenLedgerService.obtenerEstadisticas).toHaveBeenCalledWith(1);
    expect(ClaimedReward.count).toHaveBeenCalledWith({ where: { id_user: 1 } });
    expect(result).toEqual({
      id_user: 1,
      tokens_actuales: 10,
      total_ganados: 50,
      total_gastados: 40,
      canjes_realizados: 3
    });
  });
});