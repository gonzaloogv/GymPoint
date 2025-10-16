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

/**
 * Registrar presencia del usuario en el rango geofence
 * @route POST /api/assistances/presence
 * @access Private (Usuario app)
 * 
 * Esta función se llama cada 30 segundos desde el frontend
 * para trackear la presencia del usuario en el gym.
 */
const registrarPresencia = async (req, res) => {
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

    // Registrar o actualizar presencia
    const resultado = await assistanceService.registrarPresencia({
      id_user: id_user_profile,
      id_gym,
      latitude,
      longitude
    });

    return res.status(200).json({
      message: 'Presencia actualizada',
      data: {
        duracion_minutos: resultado.duracion_minutos,
        min_stay_minutes: resultado.min_stay_minutes,
        listo_para_checkin: resultado.listo_para_checkin,
        progreso: `${resultado.duracion_minutos}/${resultado.min_stay_minutes} min`
      }
    });
  } catch (err) {
    console.error('Error en registrarPresencia:', err.message);
    
    // Error específico si no es premium
    if (err.code === 'PREMIUM_FEATURE_REQUIRED') {
      return res.status(403).json({
        error: {
          code: 'PREMIUM_FEATURE_REQUIRED',
          message: err.message,
          upgrade_info: {
            feature: 'Auto Check-in',
            description: 'Registra tu asistencia automáticamente al permanecer 10 minutos en el gym',
            benefits: [
              '✅ Check-in automático',
              '✅ Sin olvidar registrar asistencia',
              '✅ Tracking en tiempo real',
              '✅ Notificaciones cuando estés listo'
            ]
          }
        }
      });
    }

    return res.status(400).json({
      error: {
        code: 'PRESENCE_REGISTRATION_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Verificar y registrar auto check-in si usuario cumplió permanencia mínima
 * @route POST /api/assistances/auto-checkin  
 * @access Private (Usuario app)
 * 
 * El frontend llama a esta función cuando detecta que
 * el usuario cumplió el tiempo mínimo de permanencia.
 */
const verificarAutoCheckIn = async (req, res) => {
  try {
    const { id_gym } = req.body;
    const id_user_profile = req.user.id_user_profile;

    if (id_gym == null) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Falta dato requerido: id_gym'
        }
      });
    }

    // Verificar presencia y crear auto check-in
    const resultado = await assistanceService.verificarAutoCheckIn({
      id_user: id_user_profile,
      id_gym
    });

    return res.status(201).json({
      message: '¡Auto check-in completado! 🎉',
      data: {
        asistencia: resultado.asistencia,
        duracion_minutos: resultado.duracion_minutos,
        tokens_actuales: resultado.tokens_actuales,
        racha_actual: resultado.racha_actual
      }
    });
  } catch (err) {
    console.error('Error en verificarAutoCheckIn:', err.message);
    
    // Error específico si no es premium
    if (err.code === 'PREMIUM_FEATURE_REQUIRED') {
      return res.status(403).json({
        error: {
          code: 'PREMIUM_FEATURE_REQUIRED',
          message: err.message,
          upgrade_info: {
            feature: 'Auto Check-in',
            description: 'Registra tu asistencia automáticamente al permanecer 10 minutos en el gym'
          }
        }
      });
    }

    // Error específico si no cumple permanencia
    if (err.code === 'MIN_STAY_NOT_MET') {
      return res.status(400).json({
        error: {
          code: 'MIN_STAY_NOT_MET',
          message: err.message
        }
      });
    }

    return res.status(400).json({
      error: {
        code: 'AUTO_CHECKIN_VERIFICATION_FAILED',
        message: err.message
      }
    });
  }
};

module.exports = {
  registrarAsistencia,
  obtenerHistorialAsistencias,
  autoCheckIn,
  checkOut,
  registrarPresencia,
  verificarAutoCheckIn
};
