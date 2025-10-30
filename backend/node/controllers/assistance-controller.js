/**
 * Controller para Assistance (CQRS refactored - Phase 4 Compliant)
 * Usa Commands/Queries para comunicarse con el service
 */

const assistanceService = require('../services/assistance-service');
const assistanceMappers = require('../services/mappers/assistance.mappers');
const {
  CreateAssistanceCommand,
  CheckOutCommand,
  RegisterPresenceCommand,
  VerifyAutoCheckInCommand
} = require('../services/commands/assistance.commands');
const {
  ListAssistancesQuery
} = require('../services/queries/assistance.queries');

/**
 * Registrar asistencia a un gimnasio (check-in normal)
 * @route POST /api/assistances
 * @access Private (Usuario app)
 */
const registrarAsistencia = async (req, res) => {
  try {
    const { id_gym, latitude, longitude, accuracy } = req.body;
    const id_user_profile = req.user.id_user_profile;

    // Validación básica
    if (id_gym == null || latitude == null || longitude == null) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Faltan datos requeridos: id_gym, latitude, longitude'
        }
      });
    }

    // Crear Command y llamar al service
    const command = new CreateAssistanceCommand({
      userProfileId: id_user_profile,
      gymId: id_gym,
      latitude,
      longitude,
      accuracy
    });
    const resultado = await assistanceService.registrarAsistencia(command);

    // Transformar resultado a DTO usando mapper
    const responseDTO = assistanceMappers.toCheckInResponseDTO(resultado);

    return res.status(201).json({
      message: 'Asistencia registrada con éxito',
      data: responseDTO
    });
  } catch (err) {
    console.error('Error en registrarAsistencia:', err.message);

    // Manejar errores específicos
    if (err.code === 'OUT_OF_RANGE' || err.code === 'GPS_INACCURATE') {
      return res.status(400).json({
        error: {
          code: err.code,
          message: err.message
        }
      });
    }

    return res.status(400).json({
      error: {
        code: err.code || 'ASSISTANCE_REGISTRATION_FAILED',
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

    // Crear Query y obtener historial del service
    const query = new ListAssistancesQuery({
      userProfileId: id_user_profile,
      includeGymDetails: true
    });
    const historial = await assistanceService.obtenerHistorialAsistencias(query);

    // Transformar a DTO usando mapper
    const responseDTO = assistanceMappers.toAssistanceHistoryDTO(historial);

    res.json(responseDTO);
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

    // Crear Command y llamar al service
    const command = new CreateAssistanceCommand({
      userProfileId: id_user_profile,
      gymId: id_gym,
      latitude,
      longitude,
      accuracy,
      autoCheckin: true
    });
    const resultado = await assistanceService.autoCheckIn(command);

    // Transformar resultado a DTO
    const responseDTO = assistanceMappers.toCheckInResponseDTO(resultado);

    return res.status(201).json({
      message: 'Auto check-in registrado con éxito',
      data: responseDTO
    });
  } catch (err) {
    console.error('Error en autoCheckIn:', err.message);

    if (err.code === 'AUTO_CHECKIN_DISABLED' || err.code === 'OUT_OF_GEOFENCE_RANGE') {
      return res.status(400).json({
        error: {
          code: err.code,
          message: err.message
        }
      });
    }

    return res.status(400).json({
      error: {
        code: err.code || 'AUTO_CHECKIN_FAILED',
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
    const assistanceId = Number.Number.parseInt(req.params.id, 10);
    const id_user_profile = req.user.id_user_profile;

    if (!Number.isInteger(assistanceId)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: 'ID de asistencia inválido'
        }
      });
    }

    // Crear Command y llamar al service
    const command = new CheckOutCommand({
      assistanceId,
      userProfileId: id_user_profile
    });
    const result = await assistanceService.checkOut(command);

    // Transformar resultado a DTO
    const responseDTO = assistanceMappers.toCheckOutResponseDTO(result);

    return res.json({
      message: 'Check-out completado',
      data: responseDTO
    });
  } catch (err) {
    console.error('Error en checkOut:', err.message);

    if (err.code === 'FORBIDDEN' || err.code === 'CHECKIN_REQUIRED') {
      return res.status(403).json({
        error: {
          code: err.code,
          message: err.message
        }
      });
    }

    return res.status(400).json({
      error: {
        code: err.code || 'CHECKOUT_FAILED',
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

    // Crear Command y registrar o actualizar presencia
    const command = new RegisterPresenceCommand({
      userProfileId: id_user_profile,
      gymId: id_gym,
      latitude,
      longitude,
      accuracy
    });
    const resultado = await assistanceService.registrarPresencia(command);

    // Transformar resultado a DTO
    const responseDTO = assistanceMappers.toPresenceResponseDTO(resultado);

    return res.status(200).json({
      message: 'Presencia actualizada',
      data: responseDTO
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
              '✓ Check-in automático',
              '✓ Sin olvidar registrar asistencia',
              '✓ Tracking en tiempo real',
              '✓ Notificaciones cuando estés listo'
            ]
          }
        }
      });
    }

    if (err.code === 'OUT_OF_GEOFENCE_RANGE') {
      return res.status(400).json({
        error: {
          code: err.code,
          message: err.message
        }
      });
    }

    return res.status(400).json({
      error: {
        code: err.code || 'PRESENCE_REGISTRATION_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Verificar si el usuario ya hizo check-in hoy
 * @route GET /api/assistances/today-status
 * @access Private (Usuario app)
 */
const verificarCheckInHoy = async (req, res) => {
  try {
    const id_user_profile = req.user.id_user_profile;

    // Obtener la fecha de hoy en formato YYYY-MM-DD
    const hoy = new Date().toISOString().split('T')[0];

    // Buscar asistencia del día
    const { assistanceRepository } = require('../infra/db/repositories');
    const asistenciaHoy = await assistanceRepository.findAssistanceByUserAndDate(id_user_profile, hoy);

    return res.json({
      has_checked_in_today: !!asistenciaHoy,
      assistance: asistenciaHoy ? {
        id_assistance: asistenciaHoy.id_assistance,
        id_gym: asistenciaHoy.id_gym,
        check_in_time: asistenciaHoy.check_in_time,
        date: asistenciaHoy.date,
        gym_name: asistenciaHoy.gym?.name || null,
        created_at: asistenciaHoy.created_at // Timestamp completo con timezone
      } : null
    });
  } catch (err) {
    console.error('Error en verificarCheckInHoy:', err.message);
    return res.status(500).json({
      error: {
        code: 'CHECK_STATUS_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Verificar y registrar auto check-in si usuario cumplió permanencia mínima
 * @route POST /api/assistances/verify-auto-checkin
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

    // Crear Command y verificar presencia para auto check-in
    const command = new VerifyAutoCheckInCommand({
      userProfileId: id_user_profile,
      gymId: id_gym
    });
    const resultado = await assistanceService.verificarAutoCheckIn(command);

    // Transformar resultado a DTO
    const responseDTO = assistanceMappers.toCheckInResponseDTO(resultado);

    return res.status(201).json({
      message: '¡Auto check-in completado! 🎉',
      data: responseDTO
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
    if (err.code === 'MIN_STAY_NOT_MET' || err.code === 'NO_ACTIVE_PRESENCE') {
      return res.status(400).json({
        error: {
          code: err.code,
          message: err.message
        }
      });
    }

    return res.status(400).json({
      error: {
        code: err.code || 'AUTO_CHECKIN_VERIFICATION_FAILED',
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
  verificarAutoCheckIn,
  verificarCheckInHoy
};
