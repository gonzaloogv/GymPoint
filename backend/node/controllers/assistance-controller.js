const assistanceService = require('../services/assistance-service');

/**
 * Registrar asistencia a un gimnasio
 * @route POST /api/assistances
 * @access Private (Usuario app)
 */
const registrarAsistencia = async (req, res) => {
  try {
    const { id_gym, latitude, longitude, accuracy } = req.body;
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
      longitude,
      accuracy
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

/**
 * Auto check-in del usuario en un gimnasio (usa geofence si existe)
 * @route POST /api/assistances/auto-checkin
 * @access Private (Usuario app)
 */
const autoCheckIn = async (req, res) => {
  try {
    const { id_gym, latitude, longitude, accuracy } = req.body;
    const id_user_profile = req.user.id_user_profile;

    if (id_gym == null || latitude == null || longitude == null) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Faltan datos requeridos: id_gym, latitude, longitude'
        }
      });
    }

    const resultado = await assistanceService.autoCheckIn({
      id_user: id_user_profile,
      id_gym,
      latitude,
      longitude,
      accuracy
    });

    return res.status(201).json({
      message: 'Auto check-in registrado con éxito',
      data: resultado
    });
  } catch (err) {
    console.error('Error en autoCheckIn:', err.message);
    return res.status(400).json({
      error: {
        code: 'AUTO_CHECKIN_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Check-out de una asistencia
 * @route PUT /api/assistances/:id/checkout
 * @access Private (Usuario app)
 */
const checkOut = async (req, res) => {
  try {
    const assistanceId = parseInt(req.params.id, 10);
    const id_user_profile = req.user.id_user_profile;
    if (!Number.isInteger(assistanceId)) {
      return res.status(400).json({ error: { code: 'INVALID_ID', message: 'ID de asistencia inválido' } });
    }

    const result = await assistanceService.checkOut(assistanceId, id_user_profile);
    return res.json({
      message: 'Check-out completado',
      data: result
    });
  } catch (err) {
    console.error('Error en checkOut:', err.message);
    return res.status(400).json({
      error: {
        code: 'CHECKOUT_FAILED',
        message: err.message
      }
    });
  }
};

module.exports = {
  registrarAsistencia,
  obtenerHistorialAsistencias,
  autoCheckIn,
  checkOut
};
