jest.mock('../models', () => ({ UserProfile: { findByPk: jest.fn() } }));
jest.mock('../models/Reward', () => ({ findAll: jest.fn(), findOne: jest.fn(), create: jest.fn() }));
jest.mock('../models/ClaimedReward', () => ({ create: jest.fn(), findAll: jest.fn() }));
jest.mock('../services/reward-code-service', () => ({ crearCodigoParaCanje: jest.fn() }));
jest.mock('../services/token-ledger-service', () => ({
  registrarMovimiento: jest.fn(),
  existeMovimiento: jest.fn()
}));
jest.mock('../config/database', () => ({
  transaction: jest.fn()
}));

const rewardService = require('../services/reward-service');
const Reward = require('../models/Reward');
const { UserProfile } = require('../models');
const ClaimedReward = require('../models/ClaimedReward');
const rewardCodeService = require('../services/reward-code-service');
const tokenLedgerService = require('../services/token-ledger-service');
const sequelize = require('../config/database');

beforeEach(() => { jest.clearAllMocks(); });

describe('listarRecompensas', () => {
  it('calls findAll with filters', async () => {
    await rewardService.listarRecompensas();
    expect(Reward.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: expect.any(Object) }));
  });
});

describe('canjearRecompensa', () => {
  beforeEach(() => {
    // Mock transaction
    const mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn()
    };
    sequelize.transaction.mockResolvedValue(mockTransaction);
  });

  it('throws when reward not available', async () => {
    Reward.findOne.mockResolvedValue(null);
    await expect(rewardService.canjearRecompensa({ id_user:1, id_reward:1, id_gym:1 })).rejects.toThrow('La recompensa no está disponible');
  });

  it('throws when reward already claimed', async () => {
    Reward.findOne.mockResolvedValue({ id_reward: 1, cost_tokens:5, stock:1, save:jest.fn() });
    tokenLedgerService.existeMovimiento.mockResolvedValue(true);

    await expect(rewardService.canjearRecompensa({ id_user:1, id_reward:1, id_gym:1 }))
      .rejects.toThrow('Esta recompensa ya fue canjeada anteriormente');
  });

  it('redeems when valid', async () => {
    const reward = { id_reward: 1, cost_tokens:5, stock:1, save:jest.fn() };
    Reward.findOne.mockResolvedValue(reward);
    tokenLedgerService.existeMovimiento.mockResolvedValue(false);
    rewardCodeService.crearCodigoParaCanje.mockResolvedValue({ id_code:1, code:'abc' });
    ClaimedReward.create.mockResolvedValue({ id_claim: 123 });
    tokenLedgerService.registrarMovimiento.mockResolvedValue({
      newBalance: 5,
      previousBalance: 10,
      ledgerEntry: {}
    });

    const result = await rewardService.canjearRecompensa({ id_user:1, id_reward:1, id_gym:1 });

    expect(result).toEqual(expect.objectContaining({
      mensaje: 'Recompensa canjeada con éxito',
      codigo: 'abc',
      nuevo_saldo: 5
    }));
    expect(rewardCodeService.crearCodigoParaCanje).toHaveBeenCalled();
    expect(tokenLedgerService.registrarMovimiento).toHaveBeenCalledWith(expect.objectContaining({
      userId: 1,
      delta: -5,
      reason: 'REWARD_CLAIM',
      refType: 'claimed_reward',
      refId: 123
    }));
  });
});
