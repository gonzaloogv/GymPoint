/**
 * Notification Mappers - Lote 9
 * Transformaciones entre DTOs, Commands/Queries y Entities para notificaciones
 */

const {
  CreateNotificationCommand,
  MarkNotificationAsReadCommand,
  MarkAllNotificationsAsReadCommand,
  DeleteNotificationCommand,
} = require('../commands/notification.commands');

const {
  ListNotificationsQuery,
  GetNotificationByIdQuery,
  CountUnreadNotificationsQuery,
} = require('../queries/notification.queries');

// ============================================================================
// DTO → Command
// ============================================================================

function toCreateNotificationCommand(dto) {
  return new CreateNotificationCommand({
    userProfileId: dto.userProfileId,
    type: dto.type,
    title: dto.title,
    message: dto.message,
    data: dto.data || null,
    priority: dto.priority || 'NORMAL',
    scheduledFor: dto.scheduledFor || null,
  });
}

function toMarkNotificationAsReadCommand(dto) {
  return new MarkNotificationAsReadCommand({
    notificationId: dto.notificationId,
    userProfileId: dto.userProfileId,
  });
}

function toMarkAllNotificationsAsReadCommand(dto) {
  return new MarkAllNotificationsAsReadCommand({
    userProfileId: dto.userProfileId,
  });
}

function toDeleteNotificationCommand(dto) {
  return new DeleteNotificationCommand({
    notificationId: dto.notificationId,
    userProfileId: dto.userProfileId,
  });
}

// ============================================================================
// DTO → Query
// ============================================================================

function toListNotificationsQuery(dto) {
  return new ListNotificationsQuery({
    userProfileId: dto.userProfileId,
    page: dto.page || 1,
    limit: dto.limit || 20,
    includeRead: dto.includeRead !== false,
    type: dto.type || null,
    priority: dto.priority || null,
    since: dto.since || null,
  });
}

function toGetNotificationByIdQuery(dto) {
  return new GetNotificationByIdQuery({
    notificationId: dto.notificationId,
    userProfileId: dto.userProfileId,
  });
}

function toCountUnreadNotificationsQuery(dto) {
  return new CountUnreadNotificationsQuery({
    userProfileId: dto.userProfileId,
  });
}

// ============================================================================
// Entity → DTO
// ============================================================================

function toNotificationDTO(notification) {
  if (!notification) return null;

  return {
    id: notification.id_notification,
    userProfileId: notification.id_user_profile,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    priority: notification.priority,
    isRead: notification.is_read,
    readAt: notification.read_at,
    scheduledFor: notification.scheduled_for,
    sentAt: notification.sent_at,
    createdAt: notification.created_at,
  };
}

function toNotificationsDTO(notifications) {
  return notifications.map(toNotificationDTO);
}

function toPaginatedNotificationsDTO(result) {
  return {
    items: toNotificationsDTO(result.items || result.rows || []),
    total: result.total || result.count || 0,
    page: result.page || 1,
    limit: result.limit || 20,
    totalPages: result.totalPages || Math.ceil((result.total || result.count || 0) / (result.limit || 20)),
  };
}

function toUnreadCountDTO(count) {
  return {
    unread: count || 0,
  };
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // DTO → Command
  toCreateNotificationCommand,
  toMarkNotificationAsReadCommand,
  toMarkAllNotificationsAsReadCommand,
  toDeleteNotificationCommand,

  // DTO → Query
  toListNotificationsQuery,
  toGetNotificationByIdQuery,
  toCountUnreadNotificationsQuery,

  // Entity → DTO
  toNotificationDTO,
  toNotificationsDTO,
  toPaginatedNotificationsDTO,
  toUnreadCountDTO,
};
