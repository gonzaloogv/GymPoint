/**
 * Workout Controller - Refactorizado con Mappers (Lote 7)
 * Gestiona endpoints de sesiones de entrenamiento y sets
 */

const workoutService = require('../services/workout-service');
const workoutMappers = require('../services/mappers/workout.mappers');
const { asyncHandler } = require('../middlewares/error-handler');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');

/**
 * POST /api/workouts/sessions
 * Iniciar una nueva sesión de entrenamiento
 */
const iniciarSesion = asyncHandler(async (req, res) => {
  const profile = req.account?.userProfile || req.user;
  if (!profile || !profile.id_user_profile) {
    return res.status(403).json({
      error: {
        code: 'USER_PROFILE_REQUIRED',
        message: 'Perfil de usuario requerido'
      }
    });
  }

  const command = workoutMappers.toStartWorkoutSessionCommand(req.body, profile.id_user_profile);
  const session = await workoutService.startWorkoutSession(command);

  res.status(201).json({
    message: 'Sesión iniciada con éxito',
    data: workoutMappers.toWorkoutSessionResponse(session)
  });
});

/**
 * GET /api/workouts/sessions/:id
 * Obtener sesión por ID
 */
const getSesion = asyncHandler(async (req, res) => {
  const query = workoutMappers.toGetWorkoutSessionQuery(Number.parseInt(req.params.id, 10), true);
  const session = await workoutService.getWorkoutSession(query);

  res.json({
    data: workoutMappers.toWorkoutSessionResponse(session)
  });
});

/**
 * GET /api/workouts/sessions/active
 * Obtener sesión activa del usuario
 */
const getActiveSesion = asyncHandler(async (req, res) => {
  const profile = req.account?.userProfile || req.user;
  if (!profile || !profile.id_user_profile) {
    return res.status(403).json({
      error: {
        code: 'USER_PROFILE_REQUIRED',
        message: 'Perfil de usuario requerido'
      }
    });
  }

  const query = workoutMappers.toGetActiveWorkoutSessionQuery(profile.id_user_profile);
  const session = await workoutService.getActiveWorkoutSession(query);

  if (!session) {
    return res.status(404).json({
      error: {
        code: 'NO_ACTIVE_SESSION',
        message: 'No hay sesión activa'
      }
    });
  }

  res.json({
    data: workoutMappers.toWorkoutSessionResponse(session)
  });
});

/**
 * GET /api/workouts/sessions/me
 * Listar sesiones del usuario
 */
const listarSesiones = asyncHandler(async (req, res) => {
  const profile = req.account?.userProfile || req.user;
  if (!profile || !profile.id_user_profile) {
    return res.status(403).json({
      error: {
        code: 'USER_PROFILE_REQUIRED',
        message: 'Perfil de usuario requerido'
      }
    });
  }

  const query = workoutMappers.toListWorkoutSessionsQuery(req.query, profile.id_user_profile);
  const sessions = await workoutService.listWorkoutSessions(query);

  res.json({
    data: workoutMappers.toWorkoutSessionsResponse(sessions)
  });
});

/**
 * GET /api/workouts/stats
 * Obtener estadísticas de workout del usuario
 */
const getStats = asyncHandler(async (req, res) => {
  const profile = req.account?.userProfile || req.user;
  if (!profile || !profile.id_user_profile) {
    return res.status(403).json({
      error: {
        code: 'USER_PROFILE_REQUIRED',
        message: 'Perfil de usuario requerido'
      }
    });
  }

  const query = workoutMappers.toGetWorkoutStatsQuery(req.query, profile.id_user_profile);
  const stats = await workoutService.getWorkoutStats(query);

  res.json({
    data: workoutMappers.toWorkoutStatsResponse(stats)
  });
});

/**
 * POST /api/workouts/sessions/:id/sets
 * Registrar un set en una sesión
 */
const registrarSet = asyncHandler(async (req, res) => {
  const sessionId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(sessionId)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_SESSION_ID',
        message: 'ID de sesión inválido'
      }
    });
  }

  const command = workoutMappers.toRegisterWorkoutSetCommand(req.body, sessionId);
  const workoutSet = await workoutService.registerWorkoutSet(command);

  res.status(201).json({
    message: 'Set registrado con éxito',
    data: workoutMappers.toWorkoutSetResponse(workoutSet)
  });
});

/**
 * GET /api/workouts/sessions/:id/sets
 * Listar sets de una sesión
 */
const listarSets = asyncHandler(async (req, res) => {
  const sessionId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(sessionId)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_SESSION_ID',
        message: 'ID de sesión inválido'
      }
    });
  }

  const query = workoutMappers.toListWorkoutSetsQuery(sessionId, req.query.id_exercise);
  const sets = await workoutService.listWorkoutSets(query);

  res.json({
    data: workoutMappers.toWorkoutSetsResponse(sets)
  });
});

/**
 * PUT /api/workouts/sets/:id
 * Actualizar un set
 */
const updateSet = asyncHandler(async (req, res) => {
  const setId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(setId)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_SET_ID',
        message: 'ID de set inválido'
      }
    });
  }

  const command = workoutMappers.toUpdateWorkoutSetCommand(req.body, setId);
  const workoutSet = await workoutService.updateWorkoutSet(command);

  res.json({
    message: 'Set actualizado con éxito',
    data: workoutMappers.toWorkoutSetResponse(workoutSet)
  });
});

/**
 * DELETE /api/workouts/sets/:id
 * Eliminar un set
 */
const deleteSet = asyncHandler(async (req, res) => {
  const setId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(setId)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_SET_ID',
        message: 'ID de set inválido'
      }
    });
  }

  const command = workoutMappers.toDeleteWorkoutSetCommand(setId);
  await workoutService.deleteWorkoutSet(command);

  res.status(204).send();
});

/**
 * PUT /api/workouts/sessions/:id/complete
 * Completar una sesión
 */
const completarSesion = asyncHandler(async (req, res) => {
  const sessionId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(sessionId)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_SESSION_ID',
        message: 'ID de sesión inválido'
      }
    });
  }

  const command = workoutMappers.toFinishWorkoutSessionCommand(req.body, sessionId);
  const session = await workoutService.finishWorkoutSession(command);

  res.json({
    message: 'Sesión completada con éxito',
    data: workoutMappers.toWorkoutSessionResponse(session)
  });
});

/**
 * PUT /api/workouts/sessions/:id/cancel
 * Cancelar una sesión
 */
const cancelarSesion = asyncHandler(async (req, res) => {
  const sessionId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(sessionId)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_SESSION_ID',
        message: 'ID de sesión inválido'
      }
    });
  }

  const command = workoutMappers.toCancelWorkoutSessionCommand(sessionId);
  const session = await workoutService.cancelWorkoutSession(command);

  res.json({
    message: 'Sesión cancelada con éxito',
    data: workoutMappers.toWorkoutSessionResponse(session)
  });
});

/**
 * PUT /api/workouts/sessions/:id
 * Actualizar metadata de sesión (notas)
 */
const updateSesion = asyncHandler(async (req, res) => {
  const sessionId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(sessionId)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_SESSION_ID',
        message: 'ID de sesión inválido'
      }
    });
  }

  const command = workoutMappers.toUpdateWorkoutSessionCommand(req.body, sessionId);
  const session = await workoutService.updateWorkoutSession(command);

  res.json({
    message: 'Sesión actualizada con éxito',
    data: workoutMappers.toWorkoutSessionResponse(session)
  });
});

module.exports = {
  // Session operations
  iniciarSesion,
  getSesion,
  getActiveSesion,
  listarSesiones,
  getStats,
  completarSesion,
  cancelarSesion,
  updateSesion,

  // Set operations
  registrarSet,
  listarSets,
  updateSet,
  deleteSet
};
