const progressService = require('../services/progress-service');

/**
 * Registrar progreso físico
 * @route POST /api/progress
 * @access Private (Usuario app)
 */
const registrarProgreso = async (req, res) => {
  try {
    const id_user_profile = req.user.id_user_profile;
    const { date, body_weight, body_fat, ejercicios } = req.body;

    const progreso = await progressService.registrarProgreso({
      id_user: id_user_profile, // El service espera id_user
      date,
      body_weight,
      body_fat,
      ejercicios
    });

    res.status(201).json({
      message: 'Progreso registrado con éxito',
      data: progreso
    });
  } catch (err) {
    res.status(400).json({ 
      error: { 
        code: 'REGISTER_PROGRESS_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Obtener todo el progreso del usuario autenticado
 * @route GET /api/progress/me
 * @access Private (Usuario app)
 */
const obtenerProgresoPorUsuario = async (req, res) => {
  try {
    const id_user_profile = req.user.id_user_profile;
    const lista = await progressService.obtenerProgresoPorUsuario(id_user_profile);
    
    res.json({
      data: lista,
      message: 'Progreso obtenido con éxito'
    });
  } catch (err) {
    res.status(404).json({ 
      error: { 
        code: 'GET_PROGRESS_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Obtener estadísticas de peso del usuario
 * @route GET /api/progress/stats/weight
 * @access Private (Usuario app)
 */
const obtenerEstadisticaPeso = async (req, res) => {
  try {
    const id_user_profile = req.user.id_user_profile;
    const datos = await progressService.obtenerEstadisticaPeso(id_user_profile);
    
    res.json({
      message: 'Estadísticas de peso obtenidas con éxito',
      data: datos
    });
  } catch (err) {
    res.status(400).json({ 
      error: { 
        code: 'GET_WEIGHT_STATS_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Obtener historial de ejercicios del usuario
 * @route GET /api/progress/exercises
 * @access Private (Usuario app)
 */
const obtenerHistorialEjercicios = async (req, res) => {
  try {
    const id_user_profile = req.user.id_user_profile;
    const data = await progressService.obtenerHistorialEjercicios(id_user_profile);
    
    res.json({
      message: 'Historial de ejercicios obtenido con éxito',
      data
    });
  } catch (err) {
    res.status(400).json({ 
      error: { 
        code: 'GET_EXERCISE_HISTORY_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Obtener historial de un ejercicio específico
 * @route GET /api/progress/exercises/:id_exercise
 * @access Private (Usuario app)
 */
const obtenerHistorialPorEjercicio = async (req, res) => {
  try {
    const id_user_profile = req.user.id_user_profile;
    const data = await progressService.obtenerHistorialPorEjercicio(
      id_user_profile,
      req.params.id_exercise
    );
    
    res.json({
      message: 'Historial del ejercicio obtenido con éxito',
      data
    });
  } catch (err) {
    res.status(400).json({ 
      error: { 
        code: 'GET_EXERCISE_HISTORY_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Obtener mejor levantamiento de un ejercicio
 * @route GET /api/progress/exercises/:id_exercise/best
 * @access Private (Usuario app)
 */
const obtenerMejorLevantamiento = async (req, res) => {
  try {
    const id_user_profile = req.user.id_user_profile;
    const mejor = await progressService.obtenerMejorLevantamiento(
      id_user_profile,
      req.params.id_exercise
    );
    
    if (!mejor) {
      return res.status(404).json({ 
        error: { 
          code: 'NO_RECORDS_FOUND', 
          message: 'No se encontraron registros para este ejercicio' 
        } 
      });
    }
    
    res.json({
      message: 'Mejor levantamiento obtenido con éxito',
      data: mejor
    });
  } catch (err) {
    res.status(400).json({ 
      error: { 
        code: 'GET_BEST_LIFT_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Obtener promedio de levantamiento de un ejercicio
 * @route GET /api/progress/exercises/:id_exercise/average
 * @access Private (Usuario app)
 */
const obtenerPromedioLevantamiento = async (req, res) => {
  try {
    const id_user_profile = req.user.id_user_profile;
    const data = await progressService.obtenerPromedioLevantamiento(
      id_user_profile,
      req.params.id_exercise
    );
    
    if (!data) {
      return res.status(404).json({ 
        error: { 
          code: 'NO_RECORDS_FOUND', 
          message: 'No se encontraron registros para este ejercicio' 
        } 
      });
    }
    
    res.json({
      message: 'Promedio de levantamiento obtenido con éxito',
      data
    });
  } catch (err) {
    res.status(400).json({ 
      error: { 
        code: 'GET_AVERAGE_LIFT_FAILED', 
        message: err.message 
      } 
    });
  }
};
  
module.exports = {
  registrarProgreso,
  obtenerProgresoPorUsuario,
  obtenerEstadisticaPeso,
  obtenerHistorialEjercicios,
  obtenerHistorialPorEjercicio,
  obtenerMejorLevantamiento,
  obtenerPromedioLevantamiento
};
