jest.mock('../models', () => ({ UserProfile: {}, TokenLedger: {} }));
jest.mock('../services/token-ledger-service', () => ({
  obtenerHistorial: jest.fn()
}));

const service = require('../services/transaction-service');
const tokenLedgerService = require('../services/token-ledger-service');

beforeEach(() => { jest.clearAllMocks(); });

describe('obtenerTransaccionesPorUsuario', () => {
  it('calls obtenerHistorial with user id', async () => {
    const mockHistorial = [
      { id_ledger: 1, delta: 10, reason: 'ATTENDANCE', balance_after: 10 },
      { id_ledger: 2, delta: -5, reason: 'REWARD_CLAIM', balance_after: 5 }
    ];
    tokenLedgerService.obtenerHistorial.mockResolvedValue(mockHistorial);

    const res = await service.obtenerTransaccionesPorUsuario(1);

    expect(tokenLedgerService.obtenerHistorial).toHaveBeenCalledWith(1);
    expect(res).toEqual(mockHistorial);
  });
});
