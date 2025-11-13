/**
 * Notification Commands - Lote 9
 * Comandos para operaciones de escritura en notificaciones
 */

// ============================================================================
// NOTIFICATION COMMANDS
// ============================================================================

/**
 * CreateNotificationCommand
 * Crea una nueva notificación para un usuario
 */
class CreateNotificationCommand {
  constructor({
    userProfileId,
    type,
    title,
    message,
    data = null,
    priority = 'NORMAL',
    scheduledFor = null,
  }) {
    this.userProfileId = userProfileId;
    this.type = type;
    this.title = title;
    this.message = message;
    this.data = data;
    this.priority = priority;
    this.scheduledFor = scheduledFor;
  }
}

/**
 * MarkNotificationAsReadCommand
 * Marca una notificación como leída
 */
class MarkNotificationAsReadCommand {
  constructor({
    notificationId,
    userProfileId,
  }) {
    this.notificationId = notificationId;
    this.userProfileId = userProfileId;
  }
}

/**
 * MarkAllNotificationsAsReadCommand
 * Marca todas las notificaciones de un usuario como leídas
 */
class MarkAllNotificationsAsReadCommand {
  constructor({ userProfileId }) {
    this.userProfileId = userProfileId;
  }
}

/**
 * DeleteNotificationCommand
 * Elimina una notificación
 */
class DeleteNotificationCommand {
  constructor({
    notificationId,
    userProfileId,
  }) {
    this.notificationId = notificationId;
    this.userProfileId = userProfileId;
  }
}

/**
 * SendScheduledNotificationsCommand
 * Procesa y envía notificaciones programadas (cron job)
 */
class SendScheduledNotificationsCommand {
  constructor({ beforeDate = new Date() }) {
    this.beforeDate = beforeDate;
  }
}

module.exports = {
  CreateNotificationCommand,
  MarkNotificationAsReadCommand,
  MarkAllNotificationsAsReadCommand,
  DeleteNotificationCommand,
  SendScheduledNotificationsCommand,
};
