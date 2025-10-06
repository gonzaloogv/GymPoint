const assistanceService = require('../services/assistance-service');

/**
 * Registrar asistencia a un gimnasio
 * @route POST /api/assistances
 * @access Private (Usuario app)
 */
const registrarAsistencia = async (req, res) => {
  try {
    const { id_gym, latitude, longitude } = req.body;
    const id_user_profile = req.user.id_user_profile; // Del middleware verificarToken

    // Validación
    if (id_gym == null || latitude == null || longitude == null) {
      return res.status(400).json({ 
        error: { 
          code: 'MISSING_FIELDS', 
          message: 'Faltan datos requeridos: id_gym, latitude, longitude' 
        } 
      });
    }

    const resultado = await assistanceService.registrarAsistencia({
      id_user: id_user_profile, // El service espera id_user
      id_gym,
      latitude,
      longitude
    });

    return res.status(201).json({
      message: 'Asistencia registrada con éxito',
      data: resultado
    });
  } catch (err) {
    console.error('Error en registrarAsistencia:', err.message);
    return res.status(400).json({ 
      error: { 
        code: 'ASSISTANCE_REGISTRATION_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Obtener historial de asistencias del usuario autenticado
 * @route GET /api/assistances/me
 * @access Private (Usuario app)
 */
const obtenerHistorialAsistencias = async (req, res) => {
  try {
    const id_user_profile = req.user.id_user_profile;
    const historial = await assistanceService.obtenerHistorialAsistencias(id_user_profile);
    
    res.json({
      message: 'Historial de asistencias obtenido con éxito',
      data: historial
    });
  } catch (err) {
    res.status(400).json({ 
      error: { 
        code: 'GET_ASSISTANCE_HISTORY_FAILED', 
        message: err.message 
      } 
    });
  }
};

module.exports = {
  registrarAsistencia,
  obtenerHistorialAsistencias
};
