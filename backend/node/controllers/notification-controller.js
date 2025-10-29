/**
 * Notification Controller - Lote 9 CQRS
 * HTTP layer for notifications using Commands/Queries/Mappers
 */

const notificationService = require('../services/notification-service');
const { notificationMappers } = require('../services/mappers');
const { asyncHandler } = require('../middlewares/error-handler');

// ============================================================================
// HELPERS
// ============================================================================

const requireUserProfile = (req, res) => {
  const profile = req.account?.userProfile;
  if (!profile) {
    res.status(403).json({
      error: {
        code: 'USER_PROFILE_REQUIRED',
        message: 'Perfil de usuario requerido',
      },
    });
    return null;
  }
  return profile;
};

// ============================================================================
// LIST NOTIFICATIONS
// ============================================================================

const listarNotificaciones = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const { limit, offset, includeRead, since } = req.query;

  const query = notificationMappers.toListNotificationsQuery({
    userProfileId: profile.id_user_profile,
    limit: limit ? Number.parseInt(limit, 10) : 20,
    page: offset ? Math.floor(Number.parseInt(offset, 10) / 20) + 1 : 1,
    includeRead: includeRead !== 'false',
    since,
  });

  const result = await notificationService.listNotifications(query);
  const dto = notificationMappers.toPaginatedNotificationsDTO(result);

  res.json(dto);
});

// ============================================================================
// COUNT UNREAD
// ============================================================================

const contarNoLeidas = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const query = notificationMappers.toCountUnreadNotificationsQuery({
    userProfileId: profile.id_user_profile,
  });

  const count = await notificationService.countUnreadNotifications(query);
  const dto = notificationMappers.toUnreadCountDTO(count);

  res.json(dto);
});

// ============================================================================
// MARK AS READ
// ============================================================================

const marcarComoLeida = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const { id } = req.params;

  const command = notificationMappers.toMarkNotificationAsReadCommand({
    notificationId: Number.parseInt(id, 10),
    userProfileId: profile.id_user_profile,
  });

  const notification = await notificationService.markNotificationAsRead(command);
  const dto = notificationMappers.toNotificationDTO(notification);

  res.json(dto);
});

// ============================================================================
// MARK ALL AS READ
// ============================================================================

const marcarTodasComoLeidas = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const command = notificationMappers.toMarkAllNotificationsAsReadCommand({
    userProfileId: profile.id_user_profile,
  });

  const updated = await notificationService.markAllNotificationsAsRead(command);

  res.json({ updated });
});

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================

const obtenerConfiguraciones = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const settings = await notificationService.getNotificationSettings({
    userProfileId: profile.id_user_profile,
  });

  res.json(settings);
});

const actualizarConfiguraciones = asyncHandler(async (req, res) => {
  const profile = requireUserProfile(req, res);
  if (!profile) return;

  const settings = await notificationService.updateNotificationSettings({
    userProfileId: profile.id_user_profile,
    ...req.body,
  });

  res.json({
    message: 'Configuraciones actualizadas',
    data: settings,
  });
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  listarNotificaciones,
  contarNoLeidas,
  marcarComoLeida,
  marcarTodasComoLeidas,
  obtenerConfiguraciones,
  actualizarConfiguraciones,
};
