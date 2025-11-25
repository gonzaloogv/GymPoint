/**
 * Handler para eventos de notificaciones en tiempo real
 */

/**
 * Registra los event handlers de notificaciones
 * @param {Socket} socket - Socket del cliente
 * @param {Server} io - Instancia de Socket.IO
 */
function register(socket, io) {
  const user = socket.user;

  // Cliente se suscribe explícitamente a notificaciones
  socket.on('notifications:subscribe', () => {
    socket.join(`notifications:${user.id_user_profile}`);
    socket.emit('notifications:subscribed', {
      success: true,
      userId: user.id_user_profile,
      message: 'Subscribed to notifications'
    });
    console.log(`[Notifications] User ${user.email} subscribed to notifications`);
  });

  // Cliente se desuscribe de notificaciones
  socket.on('notifications:unsubscribe', () => {
    socket.leave(`notifications:${user.id_user_profile}`);
    socket.emit('notifications:unsubscribed', {
      success: true,
      message: 'Unsubscribed from notifications'
    });
    console.log(`[Notifications] User ${user.email} unsubscribed from notifications`);
  });

  // Marcar notificación como leída (sin modificar lógica de servicio)
  socket.on('notifications:mark-read', async (data) => {
    try {
      if (!data.notificationId) {
        socket.emit('notifications:error', {
          message: 'notificationId is required'
        });
        return;
      }

      // Aquí solo confirmamos al cliente
      // La lógica real se mantiene en el servicio existente vía API REST
      socket.emit('notifications:read-success', {
        notificationId: data.notificationId
      });

      console.log(`[Notifications] User ${user.email} marked notification ${data.notificationId} as read`);
    } catch (error) {
      console.error(`[Notifications] Error marking notification as read:`, error.message);
      socket.emit('notifications:error', {
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  });

  // Obtener contador de notificaciones no leídas
  socket.on('notifications:get-unread-count', async () => {
    try {
      // Este evento es para sincronización rápida
      // Los clientes deberían usar la API REST para datos completos
      socket.emit('notifications:unread-count', {
        message: 'Use REST API endpoint /api/users/me/notifications for complete data'
      });
    } catch (error) {
      console.error(`[Notifications] Error getting unread count:`, error.message);
      socket.emit('notifications:error', {
        message: 'Failed to get unread count',
        error: error.message
      });
    }
  });
}

/**
 * Función auxiliar para emitir notificación a un usuario específico
 * Puede ser llamada desde servicios externos
 * @param {Server} io - Instancia de Socket.IO
 * @param {number} userProfileId - ID del perfil de usuario
 * @param {Object} notification - Datos de la notificación
 */
function emitNotification(io, userProfileId, notification) {
  try {
    io.to(`user:${userProfileId}`).emit('notification:new', {
      id: notification.id_notification,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      isRead: notification.is_read,
      createdAt: notification.created_at,
      timestamp: new Date().toISOString()
    });
    console.log(`[Notifications] Emitted notification to user ${userProfileId}`);
  } catch (error) {
    console.error(`[Notifications] Error emitting notification:`, error.message);
  }
}

/**
 * Función para emitir actualización de contador de no leídas
 * @param {Server} io - Instancia de Socket.IO
 * @param {number} userProfileId - ID del perfil de usuario
 * @param {number} unreadCount - Número de notificaciones no leídas
 */
function emitUnreadCount(io, userProfileId, unreadCount) {
  try {
    io.to(`user:${userProfileId}`).emit('notifications:unread-count', {
      count: unreadCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[Notifications] Error emitting unread count:`, error.message);
  }
}

module.exports = {
  register,
  emitNotification,
  emitUnreadCount
};
