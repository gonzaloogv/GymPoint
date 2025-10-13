const workoutService = require('../services/workout-service');
const { asyncHandler } = require('../middlewares/error-handler');

const iniciarSesion = asyncHandler(async (req, res) => {
  const profile = req.account?.userProfile;
  if (!profile) {
    return res.status(403).json({
      error: {
        code: 'USER_PROFILE_REQUIRED',
        message: 'Perfil de usuario requerido'
      }
    });
  }

  const session = await workoutService.iniciarSesion({
    id_user_profile: profile.id_user_profile,
    id_routine: req.body.id_routine ?? null,
    id_routine_day: req.body.id_routine_day ?? null,
    started_at: req.body.started_at ? new Date(req.body.started_at) : new Date(),
    notes: req.body.notes ?? null
  });

  res.status(201).json(session);
});

const registrarSet = asyncHandler(async (req, res) => {
  const sessionId = Number(req.params.id);
  if (Number.isNaN(sessionId)) {
    return res.status(400).json({ error: { code: 'INVALID_SESSION_ID', message: 'ID de sesión inválido' } });
  }

  const set = await workoutService.registrarSet(sessionId, {
    id_exercise: req.body.id_exercise,
    weight: req.body.weight,
    reps: req.body.reps,
    rpe: req.body.rpe,
    rest_seconds: req.body.rest_seconds,
    is_warmup: req.body.is_warmup,
    notes: req.body.notes,
    performed_at: req.body.performed_at ? new Date(req.body.performed_at) : new Date()
  });

  res.status(201).json(set);
});

const completarSesion = asyncHandler(async (req, res) => {
  const sessionId = Number(req.params.id);
  if (Number.isNaN(sessionId)) {
    return res.status(400).json({ error: { code: 'INVALID_SESSION_ID', message: 'ID de sesión inválido' } });
  }

  const session = await workoutService.completarSesion(sessionId, {
    ended_at: req.body.ended_at ? new Date(req.body.ended_at) : new Date(),
    notes: req.body.notes ?? null
  });

  res.json(session);
});

const cancelarSesion = asyncHandler(async (req, res) => {
  const sessionId = Number(req.params.id);
  if (Number.isNaN(sessionId)) {
    return res.status(400).json({ error: { code: 'INVALID_SESSION_ID', message: 'ID de sesión inválido' } });
  }

  const session = await workoutService.cancelarSesion(sessionId, {
    reason: req.body?.reason ?? null
  });

  res.json(session);
});

const listarSesiones = asyncHandler(async (req, res) => {
  const profile = req.account?.userProfile;
  if (!profile) {
    return res.status(403).json({
      error: {
        code: 'USER_PROFILE_REQUIRED',
        message: 'Perfil de usuario requerido'
      }
    });
  }

  const { status, limit, offset } = req.query;

  const sesiones = await workoutService.obtenerSesionesPorUsuario(profile.id_user_profile, {
    status: status ? status.split(',') : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
    offset: offset ? parseInt(offset, 10) : undefined
  });

  res.json(sesiones);
});

module.exports = {
  iniciarSesion,
  registrarSet,
  completarSesion,
  cancelarSesion,
  listarSesiones
};
