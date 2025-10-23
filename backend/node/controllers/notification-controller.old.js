const notificationService = require('../services/notification-service');
const userService = require('../services/user-service');
const { user: userMapper } = require('../services/mappers');
const { asyncHandler } = require('../middlewares/error-handler');

const requireUserProfile = (req, res) => {
  const profile = req.account?.userProfile;

  if (!profile) {
    res.status(403).json({
      error: {
        code: 'USER_PROFILE_REQUIRED',
        message: 'Perfil de usuario requerido'
      }
    });
    return null;
  }

  return profile;
};

const parsePositiveInteger = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 0 ? undefined : parsed;
};

const listarNotificaciones = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const {
    limit,
    offset,
    includeRead,
    since
  } = req.query;

  const notifications = await notificationService.listNotifications(profile.id_user_profile, {
    limit: parsePositiveInteger(limit),
    offset: parsePositiveInteger(offset),
    includeRead: includeRead !== 'false',
    since: since || undefined
  });

  res.json(notifications);
});

const contarNoLeidas = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const unread = await notificationService.countUnread(profile.id_user_profile);
  res.json({ unread });
});

const marcarComoLeida = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const { id } = req.params;
  const notificationId = parsePositiveInteger(id);
  if (notificationId === undefined) {
    res.status(400).json({
      error: {
        code: 'INVALID_NOTIFICATION_ID',
        message: 'ID de notificacion invalido'
      }
    });
    return;
  }

  const notification = await notificationService.markAsRead(notificationId, profile.id_user_profile);

  res.json(notification);
});

const marcarTodasComoLeidas = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const updated = await notificationService.markAllAsRead(profile.id_user_profile);

  res.json({
    updated
  });
});

const obtenerConfiguraciones = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const query = userMapper.toGetNotificationSettingsQuery({ userProfileId: profile.id_user_profile });
  const settings = await userService.getNotificationSettings(query);
  res.json(userMapper.toNotificationSettingsResponse(settings));
});

const actualizarConfiguraciones = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const command = userMapper.toUpdateNotificationSettingsCommand(req.body || {}, profile.id_user_profile);
  const settings = await userService.updateNotificationSettings(command);
  res.json(userMapper.toNotificationSettingsResponse(settings));
});

module.exports = {
  listarNotificaciones,
  contarNoLeidas,
  marcarComoLeida,
  marcarTodasComoLeidas,
  obtenerConfiguraciones,
  actualizarConfiguraciones
};
