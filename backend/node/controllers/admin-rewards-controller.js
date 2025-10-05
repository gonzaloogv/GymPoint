const rewardStatsService = require('../services/reward-stats-service');

/**
 * Obtener estadísticas globales de recompensas por gimnasio
 * @route GET /api/admin/rewards/stats?from=&to=
 * @access Private (Admin global)
 */
const getGlobalRewardStats = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMS',
          message: 'Parámetros requeridos: from, to (ISO date-time)'
        }
      });
    }
    
    const stats = await rewardStatsService.getGymStatsRange(from, to);
    
    res.json({
      message: 'Estadísticas globales obtenidas con éxito',
      data: {
        period: { from, to },
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

/**
 * Obtener estadísticas de un gimnasio específico
 * @route GET /api/admin/gyms/:gymId/rewards/summary?from=&to=
 * @access Private (Admin del gym o Admin global)
 */
const getGymRewardStats = async (req, res) => {
  try {
    const { gymId } = req.params;
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMS',
          message: 'Parámetros requeridos: from, to (ISO date-time)'
        }
      });
    }
    
    // TODO: Validar que el admin tiene permiso sobre este gym
    // Por ahora, cualquier admin puede ver cualquier gym
    
    const stats = await rewardStatsService.getGymStatsById(
      parseInt(gymId),
      from,
      to
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
