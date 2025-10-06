jest.mock('../models', () => ({ UserProfile: { findByPk: jest.fn() } }));
jest.mock('../models/Reward', () => ({ findAll: jest.fn(), findOne: jest.fn(), create: jest.fn() }));
jest.mock('../models/ClaimedReward', () => ({ create: jest.fn(), findAll: jest.fn() }));
jest.mock('../models/Transaction', () => ({ create: jest.fn() }));
jest.mock('../services/reward-code-service', () => ({ crearCodigoParaCanje: jest.fn() }));

const rewardService = require('../services/reward-service');
const Reward = require('../models/Reward');
const { UserProfile } = require('../models');
const ClaimedReward = require('../models/ClaimedReward');
const Transaction = require('../models/Transaction');
const rewardCodeService = require('../services/reward-code-service');

beforeEach(() => { jest.clearAllMocks(); });

describe('listarRecompensas', () => {
  it('calls findAll with filters', async () => {
    await rewardService.listarRecompensas();
    expect(Reward.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: expect.any(Object) }));
  });
});

describe('canjearRecompensa', () => {
  it('throws when reward not available', async () => {
    Reward.findOne.mockResolvedValue(null);
    await expect(rewardService.canjearRecompensa({ id_user:1, id_reward:1, id_gym:1 })).rejects.toThrow('La recompensa no está disponible');
  });

  it('throws when user tokens insufficient', async () => {
    Reward.findOne.mockResolvedValue({ cost_tokens:5, stock:1, save:jest.fn() });
    UserProfile.findByPk.mockResolvedValue({ tokens:0 });
    await expect(rewardService.canjearRecompensa({ id_user:1,id_reward:1,id_gym:1 })).rejects.toThrow('Tokens insuficientes');
  });

  it('redeems when valid', async () => {
    Reward.findOne.mockResolvedValue({ cost_tokens:5, stock:1, save:jest.fn() });
    const user = { tokens:10, save:jest.fn() };
    UserProfile.findByPk.mockResolvedValue(user);
    rewardCodeService.crearCodigoParaCanje.mockResolvedValue({ id_code:1, code:'abc' });
    ClaimedReward.create.mockResolvedValue({});
    Transaction.create.mockResolvedValue({});

    const result = await rewardService.canjearRecompensa({ id_user:1,id_reward:1,id_gym:1 });

    expect(result).toEqual(expect.objectContaining({
      mensaje: 'Recompensa canjeada con éxito',
      codigo: 'abc',
      nuevo_saldo: 5
    }));
    expect(rewardCodeService.crearCodigoParaCanje).toHaveBeenCalled();
  });
});
