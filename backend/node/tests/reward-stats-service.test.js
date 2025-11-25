jest.mock('../config/database', () => ({
  query: jest.fn(),
  QueryTypes: {
    INSERT: 'INSERT',
    SELECT: 'SELECT'
  }
}));

jest.mock('../models/ClaimedReward', () => ({}));
jest.mock('../models', () => ({ TokenLedger: {} }));
jest.mock('../models/Gym', () => ({
  findByPk: jest.fn()
}));

const rewardStatsService = require('../services/reward-stats-service');
const sequelize = require('../config/database');
const Gym = require('../models/Gym');

beforeEach(() => {
  jest.clearAllMocks();
  // Mock console methods to avoid noise in tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

describe('reward-stats-service', () => {
  describe('runDailyUpsert', () => {
    it('ejecuta upsert correctamente con fechas válidas', async () => {
      sequelize.query.mockResolvedValue([]);

      const from = new Date('2025-01-01');
      const to = new Date('2025-01-31');

      await rewardStatsService.runDailyUpsert(from, to);

      // Debe hacer 2 queries: uno para claims y otro para tokens
      expect(sequelize.query).toHaveBeenCalledTimes(2);

      // Verificar que se llama con los reemplazos correctos
      expect(sequelize.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          replacements: { from, to },
          type: 'INSERT'
        })
      );
    });

    it('lanza error con fechas inválidas', async () => {
      await expect(rewardStatsService.runDailyUpsert('invalid', 'invalid'))
        .rejects.toThrow(/Fechas inv.*lidas para upsert/);

      expect(sequelize.query).not.toHaveBeenCalled();
    });

    it('propaga errores de base de datos', async () => {
      sequelize.query.mockRejectedValueOnce(new Error('DB Error'));

      await expect(rewardStatsService.runDailyUpsert(new Date(), new Date()))
        .rejects.toThrow('DB Error');
    });
  });

  describe('getGymStatsRange', () => {
    it('obtiene estadísticas con fechas válidas', async () => {
      const mockQueryResult = [[
        { gym_id: 1, claims: 10, redeemed: 8, revoked: 2, tokens_spent: 100, tokens_refunded: 20 }
      ]];

      const mockGym = {
        id_gym: 1,
        name: 'Gym Test',
        city: 'City Test'
      };

      sequelize.query.mockResolvedValue(mockQueryResult);
      Gym.findByPk.mockResolvedValue(mockGym);

      const from = new Date('2025-01-01');
      const to = new Date('2025-01-31');

      const result = await rewardStatsService.getGymStatsRange(from, to);

      expect(sequelize.query).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('lanza error con fechas inválidas', async () => {
      await expect(rewardStatsService.getGymStatsRange('invalid', new Date()))
        .rejects.toThrow(/Fechas inv.*lidas/);

      expect(sequelize.query).not.toHaveBeenCalled();
    });
  });

  describe('getGymStatsById', () => {
    it('obtiene estadísticas de un gimnasio específico', async () => {
      const mockQueryResult = [[
        { total_claims: 50, total_redeemed: 40, total_revoked: 5 }
      ]];

      const mockGym = {
        id_gym: 1,
        name: 'Gym Test',
        city: 'City Test'
      };

      sequelize.query.mockResolvedValue(mockQueryResult);
      Gym.findByPk.mockResolvedValue(mockGym);

      const from = new Date('2025-01-01');
      const to = new Date('2025-01-31');

      const result = await rewardStatsService.getGymStatsById(1, from, to);

      expect(sequelize.query).toHaveBeenCalled();
      expect(Gym.findByPk).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
    });

    it('lanza error si gimnasio no existe', async () => {
      Gym.findByPk.mockResolvedValue(null);

      const from = new Date('2025-01-01');
      const to = new Date('2025-01-31');

      await expect(rewardStatsService.getGymStatsById(999, from, to))
        .rejects.toThrow();
    });
  });
});
