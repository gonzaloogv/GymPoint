/**
 * Handler para eventos de administración en tiempo real
 * Gestiona solicitudes de gimnasios, gestión de usuarios, etc.
 */

/**
 * Registra los event handlers de administración
 * @param {Socket} socket - Socket del cliente
 * @param {Server} io - Instancia de Socket.IO
 */
function register(socket, io) {
  const user = socket.user;

  // Solo admins pueden suscribirse a eventos de administración
  if (!user.roles || !user.roles.includes('ADMIN')) {
    console.log(`[Admin] ❌ User ${user.email} is NOT authorized for admin events (roles: ${JSON.stringify(user.roles)})`);

    // Emitir error al cliente
    socket.emit('admin:auth:error', {
      success: false,
      message: 'You do not have admin privileges',
      roles: user.roles || []
    });
    return;
  }

  console.log(`[Admin] ✅ User ${user.email} has ADMIN role - registering handlers`);

  // Admin se suscribe a eventos de solicitudes de gimnasios
  socket.on('admin:subscribe:gym-requests', () => {
    socket.join('admin:gym-requests');
    socket.emit('admin:subscribed:gym-requests', {
      success: true,
      message: 'Subscribed to gym requests'
    });
    console.log(`[Admin] ${user.email} subscribed to gym requests`);
  });

  // Admin se desuscribe de solicitudes de gimnasios
  socket.on('admin:unsubscribe:gym-requests', () => {
    socket.leave('admin:gym-requests');
    socket.emit('admin:unsubscribed:gym-requests', {
      success: true,
      message: 'Unsubscribed from gym requests'
    });
    console.log(`[Admin] ${user.email} unsubscribed from gym requests`);
  });

  // Admin se suscribe a eventos de gestión de usuarios
  socket.on('admin:subscribe:user-management', () => {
    socket.join('admin:user-management');
    socket.emit('admin:subscribed:user-management', {
      success: true,
      message: 'Subscribed to user management events'
    });
    console.log(`[Admin] ${user.email} subscribed to user management`);
  });

  // Admin se desuscribe de gestión de usuarios
  socket.on('admin:unsubscribe:user-management', () => {
    socket.leave('admin:user-management');
    socket.emit('admin:unsubscribed:user-management', {
      success: true,
      message: 'Unsubscribed from user management events'
    });
    console.log(`[Admin] ${user.email} unsubscribed from user management`);
  });

  // Admin se suscribe a estadísticas del dashboard
  socket.on('admin:subscribe:stats', () => {
    socket.join('admin:stats');
    socket.emit('admin:subscribed:stats', {
      success: true,
      message: 'Subscribed to admin stats'
    });
    console.log(`[Admin] ${user.email} subscribed to admin stats`);
  });

  // Admin se desuscribe de estadísticas
  socket.on('admin:unsubscribe:stats', () => {
    socket.leave('admin:stats');
    socket.emit('admin:unsubscribed:stats', {
      success: true,
      message: 'Unsubscribed from admin stats'
    });
    console.log(`[Admin] ${user.email} unsubscribed from admin stats`);
  });
}

/**
 * Función auxiliar para emitir evento de nueva solicitud de gimnasio a admins
 * @param {Server} io - Instancia de Socket.IO
 * @param {Object} gymRequest - Datos de la solicitud
 */
function emitGymRequestCreated(io, gymRequest) {
  try {
    io.to('admin:gym-requests').emit('gym:request:created', {
      gymRequest,
      timestamp: new Date().toISOString()
    });
    console.log(`[Admin] Emitted gym request created event`);
  } catch (error) {
    console.error(`[Admin] Error emitting gym request created:`, error.message);
  }
}

/**
 * Función auxiliar para emitir evento de solicitud aprobada
 * @param {Server} io - Instancia de Socket.IO
 * @param {Object} data - Datos de la aprobación
 */
function emitGymRequestApproved(io, data) {
  try {
    io.to('admin:gym-requests').emit('gym:request:approved', data);
    console.log(`[Admin] Emitted gym request approved event`);
  } catch (error) {
    console.error(`[Admin] Error emitting gym request approved:`, error.message);
  }
}

/**
 * Función auxiliar para emitir evento de solicitud rechazada
 * @param {Server} io - Instancia de Socket.IO
 * @param {Object} data - Datos del rechazo
 */
function emitGymRequestRejected(io, data) {
  try {
    io.to('admin:gym-requests').emit('gym:request:rejected', data);
    console.log(`[Admin] Emitted gym request rejected event`);
  } catch (error) {
    console.error(`[Admin] Error emitting gym request rejected:`, error.message);
  }
}

/**
 * Función auxiliar para emitir actualización de estadísticas
 * @param {Server} io - Instancia de Socket.IO
 * @param {Object} stats - Estadísticas actualizadas
 */
function emitStatsUpdated(io, stats) {
  try {
    io.to('admin:stats').emit('admin:stats:updated', {
      stats,
      timestamp: new Date().toISOString()
    });
    console.log(`[Admin] Emitted stats updated event`);
  } catch (error) {
    console.error(`[Admin] Error emitting stats updated:`, error.message);
  }
}

module.exports = {
  register,
  emitGymRequestCreated,
  emitGymRequestApproved,
  emitGymRequestRejected,
  emitStatsUpdated
};
