jest.mock('../models/RewardCode', () => ({ create: jest.fn(), findAll: jest.fn(), findByPk: jest.fn() }));
jest.mock('../models/ClaimedReward', () => ({ findAll: jest.fn() }));
jest.mock('../models/Reward', () => ({}));
jest.mock('../models/Gym', () => ({}));

const service = require('../services/reward-code-service');
const RewardCode = require('../models/RewardCode');

beforeEach(() => { jest.clearAllMocks(); });

describe('crearCodigoParaCanje', () => {
  it('creates code with random string', async () => {
    RewardCode.create.mockResolvedValue({ code: 'abc' });
    const result = await service.crearCodigoParaCanje({ id_reward:1,id_gym:1 });
    expect(RewardCode.create).toHaveBeenCalled();
    expect(result.code).toBe('abc');
  });
});

describe('marcarComoUsado', () => {
  it('throws when code not found', async () => {
    RewardCode.findByPk.mockResolvedValue(null);
    await expect(service.marcarComoUsado(1)).rejects.toThrow('Código no encontrado.');
  });
});