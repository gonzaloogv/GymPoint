const rewardService = require('../services/reward-service');

/**
 * Listar recompensas disponibles
 * @route GET /api/rewards
 * @access Public
 */
const listarRecompensas = async (req, res) => {
  try {
    const recompensas = await rewardService.listarRecompensas();
    
    res.json({
      message: 'Recompensas obtenidas con éxito',
      data: recompensas
    });
  } catch (err) {
    res.status(500).json({ 
      error: { 
        code: 'GET_REWARDS_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Canjear recompensa por tokens
 * @route POST /api/rewards/redeem
 * @access Private (Usuario app)
 */
const canjearRecompensa = async (req, res) => {
  try {
    const id_user_profile = req.user.id_user_profile;
    const { id_reward, id_gym } = req.body;

    if (!id_reward || !id_gym) {
      return res.status(400).json({ 
        error: { 
          code: 'MISSING_FIELDS', 
          message: 'Faltan datos requeridos: id_reward, id_gym' 
        } 
      });
    }

    const result = await rewardService.canjearRecompensa({ 
      id_user: id_user_profile, // El service espera id_user
      id_reward, 
      id_gym 
    });
    
    res.status(201).json({
      message: result.mensaje,
      data: {
        claimed: result.claimed,
        codigo: result.codigo,
        nuevo_saldo: result.nuevo_saldo
      }
    });
  } catch (err) {
    res.status(400).json({ 
      error: { 
        code: 'REDEEM_REWARD_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Obtener historial de recompensas canjeadas del usuario
 * @route GET /api/rewards/me
 * @access Private (Usuario app)
 */
const obtenerHistorialRecompensas = async (req, res) => {
  try {
    const id_user_profile = req.user.id_user_profile;
    const historial = await rewardService.obtenerHistorialRecompensas(id_user_profile);
    
    res.json({
      message: 'Historial de recompensas obtenido con éxito',
      data: historial
    });
  } catch (err) {
    res.status(400).json({ 
      error: { 
        code: 'GET_REWARD_HISTORY_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Obtener estadísticas de recompensas más canjeadas (Admin)
 * @route GET /api/rewards/stats
 * @access Private (Admin)
 */
const obtenerEstadisticasDeRecompensas = async (req, res) => {
  try {
    const estadisticas = await rewardService.obtenerEstadisticasDeRecompensas();
    
    res.json({
      message: 'Estadísticas de recompensas obtenidas con éxito',
      data: estadisticas
    });
  } catch (err) {
    res.status(400).json({ 
      error: { 
        code: 'GET_REWARD_STATS_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Crear nueva recompensa (Admin)
 * @route POST /api/rewards
 * @access Private (Admin)
 */
const crearRecompensa = async (req, res) => {
  try {
    const { name, description, cost_tokens, type, stock, start_date, finish_date } = req.body;

    if (!name || !description || !cost_tokens || !type || !stock || !start_date || !finish_date) {
      return res.status(400).json({ 
        error: { 
          code: 'MISSING_FIELDS', 
          message: 'Faltan datos requeridos: name, description, cost_tokens, type, stock, start_date, finish_date' 
        } 
      });
    }

    const recompensa = await rewardService.crearRecompensa({
      name,
      description,
      cost_tokens,
      type,
      stock,
      start_date,
      finish_date
    });

    res.status(201).json({
      message: 'Recompensa creada con éxito',
      data: recompensa
    });
  } catch (err) {
    res.status(400).json({ 
      error: { 
        code: 'CREATE_REWARD_FAILED', 
        message: err.message 
      } 
    });
  }
};

module.exports = {
  listarRecompensas,
  canjearRecompensa,
  obtenerHistorialRecompensas,
  obtenerEstadisticasDeRecompensas,
  crearRecompensa
};
