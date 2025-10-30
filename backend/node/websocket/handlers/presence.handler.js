/**
 * Handler para eventos de presencia en gimnasios en tiempo real
 * Permite a los usuarios ver quién está en el gimnasio actualmente
 */

/**
 * Registra los event handlers de presencia
 * @param {Socket} socket - Socket del cliente
 * @param {Server} io - Instancia de Socket.IO
 */
function register(socket, io) {
  const user = socket.user;

  // Usuario se une al room de un gimnasio para ver presencia
  socket.on('presence:join-gym', (data) => {
    try {
      const { gymId } = data;

      if (!gymId) {
        socket.emit('presence:error', {
          message: 'gymId is required'
        });
        return;
      }

      socket.join(`gym:${gymId}`);
      socket.emit('presence:joined-gym', {
        success: true,
        gymId,
        message: `Joined gym ${gymId} presence updates`
      });

      console.log(`[Presence] User ${user.email} joined gym ${gymId} presence room`);
    } catch (error) {
      console.error(`[Presence] Error joining gym:`, error.message);
      socket.emit('presence:error', {
        message: 'Failed to join gym presence',
        error: error.message
      });
    }
  });

  // Usuario sale del room de un gimnasio
  socket.on('presence:leave-gym', (data) => {
    try {
      const { gymId } = data;

      if (!gymId) {
        socket.emit('presence:error', {
          message: 'gymId is required'
        });
        return;
      }

      socket.leave(`gym:${gymId}`);
      socket.emit('presence:left-gym', {
        success: true,
        gymId,
        message: `Left gym ${gymId} presence updates`
      });

      console.log(`[Presence] User ${user.email} left gym ${gymId} presence room`);
    } catch (error) {
      console.error(`[Presence] Error leaving gym:`, error.message);
      socket.emit('presence:error', {
        message: 'Failed to leave gym presence',
        error: error.message
      });
    }
  });

  // Usuario hace check-in en gimnasio (notificación, la lógica está en el servicio)
  socket.on('presence:checkin', (data) => {
    try {
      const { gymId } = data;

      if (!gymId) {
        socket.emit('presence:error', {
          message: 'gymId is required'
        });
        return;
      }

      // Unirse al room del gimnasio automáticamente
      socket.join(`gym:${gymId}`);

      // Notificar a todos en el gimnasio
      io.to(`gym:${gymId}`).emit('presence:user-entered', {
        userId: user.id_user_profile,
        gymId,
        timestamp: new Date().toISOString()
      });

      socket.emit('presence:checkin-success', {
        success: true,
        gymId,
        timestamp: new Date().toISOString()
      });

      console.log(`[Presence] User ${user.email} checked in to gym ${gymId}`);
    } catch (error) {
      console.error(`[Presence] Error on checkin:`, error.message);
      socket.emit('presence:error', {
        message: 'Failed to checkin',
        error: error.message
      });
    }
  });

  // Usuario hace check-out de gimnasio
  socket.on('presence:checkout', (data) => {
    try {
      const { gymId } = data;

      if (!gymId) {
        socket.emit('presence:error', {
          message: 'gymId is required'
        });
        return;
      }

      // Notificar a todos en el gimnasio
      io.to(`gym:${gymId}`).emit('presence:user-left', {
        userId: user.id_user_profile,
        gymId,
        timestamp: new Date().toISOString()
      });

      // Salir del room del gimnasio
      socket.leave(`gym:${gymId}`);

      socket.emit('presence:checkout-success', {
        success: true,
        gymId,
        timestamp: new Date().toISOString()
      });

      console.log(`[Presence] User ${user.email} checked out from gym ${gymId}`);
    } catch (error) {
      console.error(`[Presence] Error on checkout:`, error.message);
      socket.emit('presence:error', {
        message: 'Failed to checkout',
        error: error.message
      });
    }
  });

  // Solicitar conteo actual de presencia en gimnasio
  socket.on('presence:get-count', (data) => {
    try {
      const { gymId } = data;

      if (!gymId) {
        socket.emit('presence:error', {
          message: 'gymId is required'
        });
        return;
      }

      // Los datos reales deben venir del servicio vía API REST
      socket.emit('presence:count', {
        gymId,
        message: 'Use REST API endpoint for complete presence data'
      });

      console.log(`[Presence] User ${user.email} requested count for gym ${gymId}`);
    } catch (error) {
      console.error(`[Presence] Error getting count:`, error.message);
      socket.emit('presence:error', {
        message: 'Failed to get presence count',
        error: error.message
      });
    }
  });
}

/**
 * Función auxiliar para emitir actualización de presencia a un gimnasio
 * @param {Server} io - Instancia de Socket.IO
 * @param {number} gymId - ID del gimnasio
 * @param {Object} presenceData - Datos de presencia
 */
function emitPresenceUpdate(io, gymId, presenceData) {
  try {
    io.to(`gym:${gymId}`).emit('presence:updated', {
      gymId,
      currentCount: presenceData.currentCount,
      users: presenceData.users || [],
      timestamp: new Date().toISOString()
    });
    console.log(`[Presence] Emitted presence update for gym ${gymId}`);
  } catch (error) {
    console.error(`[Presence] Error emitting presence update:`, error.message);
  }
}

/**
 * Función para notificar entrada de usuario a gimnasio
 * @param {Server} io - Instancia de Socket.IO
 * @param {number} gymId - ID del gimnasio
 * @param {number} userId - ID del usuario
 */
function emitUserEntered(io, gymId, userId) {
  try {
    io.to(`gym:${gymId}`).emit('presence:user-entered', {
      userId,
      gymId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[Presence] Error emitting user entered:`, error.message);
  }
}

/**
 * Función para notificar salida de usuario de gimnasio
 * @param {Server} io - Instancia de Socket.IO
 * @param {number} gymId - ID del gimnasio
 * @param {number} userId - ID del usuario
 */
function emitUserLeft(io, gymId, userId) {
  try {
    io.to(`gym:${gymId}`).emit('presence:user-left', {
      userId,
      gymId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[Presence] Error emitting user left:`, error.message);
  }
}

module.exports = {
  register,
  emitPresenceUpdate,
  emitUserEntered,
  emitUserLeft
};
