/**
 * Notification Queries - Lote 9
 * Consultas para operaciones de lectura en notificaciones
 */

// ============================================================================
// NOTIFICATION QUERIES
// ============================================================================

/**
 * ListNotificationsQuery
 * Lista las notificaciones de un usuario con filtros
 */
class ListNotificationsQuery {
  constructor({
    userProfileId,
    page = 1,
    limit = 20,
    includeRead = true,
    type = null,
    priority = null,
    since = null,
  }) {
    this.userProfileId = userProfileId;
    this.page = page;
    this.limit = limit;
    this.includeRead = includeRead;
    this.type = type;
    this.priority = priority;
    this.since = since;
  }
}

/**
 * GetNotificationByIdQuery
 * Obtiene una notificación específica
 */
class GetNotificationByIdQuery {
  constructor({
    notificationId,
    userProfileId,
  }) {
    this.notificationId = notificationId;
    this.userProfileId = userProfileId;
  }
}

/**
 * CountUnreadNotificationsQuery
 * Cuenta las notificaciones no leídas de un usuario
 */
class CountUnreadNotificationsQuery {
  constructor({ userProfileId }) {
    this.userProfileId = userProfileId;
  }
}

/**
 * ListScheduledNotificationsQuery
 * Lista notificaciones programadas pendientes de envío
 */
class ListScheduledNotificationsQuery {
  constructor({
    beforeDate = new Date(),
    limit = 100,
  }) {
    this.beforeDate = beforeDate;
    this.limit = limit;
  }
}

module.exports = {
  ListNotificationsQuery,
  GetNotificationByIdQuery,
  CountUnreadNotificationsQuery,
  ListScheduledNotificationsQuery,
};
