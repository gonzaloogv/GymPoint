const userGymService = require('../services/user-gym-service');

/**
 * Alta en gimnasio
 * @route POST /api/user-gym/alta
 * @access Private
 */
const darAltaEnGimnasio = async (req, res) => {
  try {
    const id_user = req.user?.id_user_profile;
    const { id_gym, plan } = req.body;

    // Validar campos requeridos
    if (!id_gym || !plan) {
      return res.status(400).json({ 
        error: { 
          code: 'MISSING_FIELDS', 
          message: 'Faltan datos requeridos (id_gym, plan)' 
        } 
      });
    }

    // Catálogo de planes permitidos
    const PLANES_VALIDOS = ['MENSUAL', 'SEMANAL', 'ANUAL'];
    const planNormalizado = plan.toUpperCase().trim();

    // Validar plan
    if (!PLANES_VALIDOS.includes(planNormalizado)) {
      return res.status(422).json({ 
        error: { 
          code: 'INVALID_PLAN', 
          message: `Plan inválido. Valores aceptados: ${PLANES_VALIDOS.join(', ')}`,
          accepted_values: PLANES_VALIDOS
        } 
      });
    }

    const alta = await userGymService.darAltaEnGimnasio({ 
      id_user, 
      id_gym, 
      plan: planNormalizado 
    });
    
    res.status(201).json({
      message: 'Alta en gimnasio realizada con éxito',
      data: alta
    });
  } catch (err) {
    console.error('Error en darAltaEnGimnasio:', err.message);
    res.status(400).json({ 
      error: { 
        code: 'ALTA_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Baja en gimnasio
 * @route POST /api/user-gym/baja
 * @access Private
 */
const darBajaEnGimnasio = async (req, res) => {
  try {
    const id_user = req.user?.id_user_profile;
    const { id_gym } = req.body;

    if (!id_gym) {
      return res.status(400).json({ 
        error: { 
          code: 'MISSING_FIELDS', 
          message: 'Falta el ID del gimnasio' 
        } 
      });
    }

    const baja = await userGymService.darBajaEnGimnasio({ id_user, id_gym });
    res.json({
      message: 'Baja en gimnasio realizada con éxito',
      data: baja
    });
  } catch (err) {
    console.error('Error en darBajaEnGimnasio:', err.message);
    res.status(400).json({ 
      error: { 
        code: 'BAJA_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Obtener gimnasios activos del usuario
 * @route GET /api/user-gym/activos
 * @access Private
 */
const obtenerGimnasiosActivos = async (req, res) => {
  try {
    const id_user = req.user?.id_user_profile;
    const resultado = await userGymService.obtenerGimnasiosActivos(id_user);
    res.json({
      message: 'Gimnasios activos obtenidos con éxito',
      data: resultado
    });
  } catch (err) {
    console.error('Error en obtenerGimnasiosActivos:', err.message);
    res.status(400).json({ 
      error: { 
        code: 'GET_ACTIVOS_FAILED', 
        message: err.message 
      } 
    });
  }
};
  
/**
 * Obtener historial de gimnasios del usuario
 * @route GET /api/user-gym/historial
 * @access Private
 */
const obtenerHistorialGimnasiosPorUsuario = async (req, res) => {
  try {
    const id_user = req.user?.id_user_profile;
    const { active } = req.query;

    const historial = await userGymService.obtenerHistorialGimnasiosPorUsuario(id_user, active);
    res.json({
      message: 'Historial de gimnasios obtenido con éxito',
      data: historial
    });
  } catch (err) {
    console.error('Error en obtenerHistorialGimnasiosPorUsuario:', err.message);
    res.status(400).json({ 
      error: { 
        code: 'GET_HISTORIAL_FAILED', 
        message: err.message 
      } 
    });
  }
};

const obtenerHistorialUsuariosPorGimnasio = async (req, res) => {
  try {
    const { id_gym } = req.params;
    const { active } = req.query;

    const historial = await userGymService.obtenerHistorialUsuariosPorGimnasio(id_gym, active);
    res.json(historial);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const contarUsuariosActivosEnGimnasio = async (req, res) => {
  try {
    const total = await userGymService.contarUsuariosActivosEnGimnasio(req.params.id_gym);
    res.json({ id_gym: req.params.id_gym, usuarios_activos: total });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 

module.exports = {
  darAltaEnGimnasio,
  darBajaEnGimnasio,
  obtenerGimnasiosActivos,
  obtenerHistorialGimnasiosPorUsuario,
  obtenerHistorialUsuariosPorGimnasio,
  contarUsuariosActivosEnGimnasio
};
