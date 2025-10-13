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
  res.status(201).json(metric);
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
    limit: limit ? parseInt(limit, 10) : undefined,
    offset: offset ? parseInt(offset, 10) : undefined
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

module.exports = {
  registrarMetricas,
  listarMetricas,
  obtenerUltimaMetrica
};
