const rewardStatsService = require('../services/reward-stats-service');

const DEFAULT_RANGE_DAYS = 30;

const resolveDateRange = (from, to) => {
  const end = to ? new Date(to) : new Date();
  if (Number.isNaN(end.getTime())) {
    throw new TypeError('Fecha final invalida');
  }

  const start = from ? new Date(from) : new Date(end.getTime() - DEFAULT_RANGE_DAYS * 24 * 60 * 60 * 1000);
  if (Number.isNaN(start.getTime())) {
    throw new TypeError('Fecha inicial invalida');
  }

  if (start > end) {
    throw new Error('La fecha de inicio debe ser anterior o igual a la fecha fin');
  }

  return {
    from: start.toISOString(),
    to: end.toISOString()
  };
};

const getGlobalRewardStats = async (req, res) => {
  try {
    const { from, to } = req.query;
    const { from: resolvedFrom, to: resolvedTo } = resolveDateRange(from, to);

    const stats = await rewardStatsService.getGymStatsRange(resolvedFrom, resolvedTo);

    res.json({
      message: 'Estadisticas globales obtenidas con exito',
      data: {
        period: { from: resolvedFrom, to: resolvedTo },
        gyms: stats,
        summary: {
          total_gyms: stats.length,
          total_claims: stats.reduce((sum, s) => sum + s.claims, 0),
          total_redeemed: stats.reduce((sum, s) => sum + s.redeemed, 0),
          total_tokens_spent: stats.reduce((sum, s) => sum + s.tokens_spent, 0)
        }
      }
    });
  } catch (err) {
    console.error('Error en getGlobalRewardStats:', err.message);
    res.status(400).json({
      error: {
        code: 'GET_STATS_FAILED',
        message: err.message
      }
    });
  }
};

const getGymRewardStats = async (req, res) => {
  try {
    const { id_gym } = req.params;
    const { from, to } = req.query;
    const { from: resolvedFrom, to: resolvedTo } = resolveDateRange(from, to);

    const stats = await rewardStatsService.getGymStatsById(
      Number.parseInt(id_gym, 10),
      resolvedFrom,
      resolvedTo
    );

    res.json({
      message: 'Estadísticas del gimnasio obtenidas con éxito',
      data: stats
    });
  } catch (err) {
    console.error('Error en getGymRewardStats:', err.message);

    if (err.message === 'Gimnasio no encontrado') {
      return res.status(404).json({
        error: {
          code: 'GYM_NOT_FOUND',
          message: err.message
        }
      });
    }

    res.status(400).json({
      error: {
        code: 'GET_GYM_STATS_FAILED',
        message: err.message
      }
    });
  }
};

module.exports = {
  getGlobalRewardStats,
  getGymRewardStats
};
