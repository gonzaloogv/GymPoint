const userService = require('../services/user-service');
const { asyncHandler } = require('../middlewares/error-handler');

const registrarMetricas = asyncHandler(async (req, res) => {
  const profile = req.account?.userProfile;
  if (!profile) {
    return res.status(403).json({
      error: {
        code: 'USER_PROFILE_REQUIRED',
        message: 'Perfil de usuario requerido'
      }
    });
  }

  const metric = await userService.registrarMetricasCorporales(profile.id_user_profile, req.body || {});

  res.status(201).json({
    message: 'Métrica corporal registrada exitosamente',
    data: metric
  });
});

const listarMetricas = asyncHandler(async (req, res) => {
  const profile = req.account?.userProfile;
  if (!profile) {
    return res.status(403).json({
      error: {
        code: 'USER_PROFILE_REQUIRED',
        message: 'Perfil de usuario requerido'
      }
    });
  }

  const { limit, offset } = req.query;

  const metrics = await userService.listarMetricasCorporales(profile.id_user_profile, {
    limit: limit ? Number.parseInt(limit, 10) : undefined,
    offset: offset ? Number.parseInt(offset, 10) : undefined
  });

  res.json(metrics);
});

const obtenerUltimaMetrica = asyncHandler(async (req, res) => {
  const profile = req.account?.userProfile;
  if (!profile) {
    return res.status(403).json({
      error: {
        code: 'USER_PROFILE_REQUIRED',
        message: 'Perfil de usuario requerido'
      }
    });
  }

  const metric = await userService.obtenerUltimaMetricaCorporal(profile.id_user_profile);
  res.json(metric || null);
});

const actualizarMetrica = asyncHandler(async (req, res) => {
  const profile = req.account?.userProfile;
  if (!profile) {
    return res.status(403).json({
      error: {
        code: 'USER_PROFILE_REQUIRED',
        message: 'Perfil de usuario requerido'
      }
    });
  }

  const { id_metric } = req.params;

  const metric = await userService.actualizarMetricaCorporal(
    profile.id_user_profile,
    Number.parseInt(id_metric, 10),
    req.body || {}
  );

  res.json({
    message: 'Métrica corporal actualizada exitosamente',
    data: metric
  });
});

module.exports = {
  registrarMetricas,
  listarMetricas,
  obtenerUltimaMetrica,
  actualizarMetrica
};
