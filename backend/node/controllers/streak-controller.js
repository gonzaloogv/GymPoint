const streakService = require('../services/streak-service');

/**
 * Obtener la racha actual del usuario autenticado
 * GET /api/streak/me
 */
const obtenerRachaActual = async (req, res) => {
  try {
    const id_user_profile = req.user.id_user_profile;
    const racha = await streakService.obtenerRachaUsuario(id_user_profile);
    res.json(racha);
  } catch (err) {
    res.status(404).json({
      error: {
        code: 'STREAK_NOT_FOUND',
        message: err.message
      }
    });
  }
};

/**
 * Usar un item de recuperación para proteger la racha
 * POST /api/streak/use-recovery
 */
const usarRecuperacion = async (req, res) => {
  try {
    const id_user_profile = req.user.id_user_profile;
    const resultado = await streakService.usarItemRecuperacion(id_user_profile);
    res.json(resultado);
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'USE_RECOVERY_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Obtener estadísticas de racha (Admin)
 * GET /api/streak/stats
 */
const obtenerEstadisticas = async (req, res) => {
  try {
    const stats = await streakService.obtenerEstadisticasGlobales();
    res.json(stats);
  } catch (err) {
    res.status(500).json({
      error: {
        code: 'STATS_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Resetear racha de un usuario (Admin)
 * PUT /api/streak/:id_user_profile/reset
 */
const resetearRacha = async (req, res) => {
  try {
    const { id_user_profile } = req.params;
    const racha = await streakService.resetearRachaUsuario(parseInt(id_user_profile));
    res.json({
      message: 'Racha reseteada exitosamente',
      racha
    });
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'RESET_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Otorgar items de recuperación a un usuario (Admin)
 * POST /api/streak/:id_user_profile/grant-recovery
 */
const otorgarRecuperacion = async (req, res) => {
  try {
    const { id_user_profile } = req.params;
    const { cantidad } = req.body;

    if (!cantidad || cantidad < 1) {
      return res.status(400).json({
        error: {
          code: 'INVALID_AMOUNT',
          message: 'La cantidad debe ser mayor a 0'
        }
      });
    }

    const racha = await streakService.otorgarItemsRecuperacion(
      parseInt(id_user_profile),
      cantidad
    );

    res.json({
      message: `Se otorgaron ${cantidad} item(s) de recuperación`,
      racha
    });
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'GRANT_RECOVERY_FAILED',
        message: err.message
      }
    });
  }
};

module.exports = {
  obtenerRachaActual,
  usarRecuperacion,
  obtenerEstadisticas,
  resetearRacha,
  otorgarRecuperacion
};
