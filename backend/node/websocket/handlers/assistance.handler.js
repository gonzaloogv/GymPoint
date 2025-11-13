/**
 * Handler para eventos de asistencias (check-ins) en tiempo real
 * Permite notificar en tiempo real cuando un usuario registra asistencia
 */

/**
 * Registra los event handlers de asistencias
 * @param {Socket} socket - Socket del cliente
 * @param {Server} io - Instancia de Socket.IO
 */
function register(socket, io) {
  const user = socket.user;

  // Suscribirse a actualizaciones de asistencias de un gimnasio
  socket.on('assistance:subscribe-gym', (data) => {
    try {
      const { gymId } = data;

      if (!gymId) {
        socket.emit('assistance:error', {
          message: 'gymId is required'
        });
        return;
      }

      socket.join(`assistance:gym:${gymId}`);
      socket.emit('assistance:subscribed', {
        success: true,
        gymId,
        message: `Subscribed to assistance updates for gym ${gymId}`
      });

      console.log(`[Assistance] User ${user.email} subscribed to gym ${gymId} assistance updates`);
    } catch (error) {
      console.error(`[Assistance] Error subscribing to gym:`, error.message);
      socket.emit('assistance:error', {
        message: 'Failed to subscribe to gym assistance',
        error: error.message
      });
    }
  });

  // Desuscribirse de actualizaciones de asistencias
  socket.on('assistance:unsubscribe-gym', (data) => {
    try {
      const { gymId } = data;

      if (!gymId) {
        socket.emit('assistance:error', {
          message: 'gymId is required'
        });
        return;
      }

      socket.leave(`assistance:gym:${gymId}`);
      socket.emit('assistance:unsubscribed', {
        success: true,
        gymId,
        message: `Unsubscribed from assistance updates for gym ${gymId}`
      });

      console.log(`[Assistance] User ${user.email} unsubscribed from gym ${gymId} assistance updates`);
    } catch (error) {
      console.error(`[Assistance] Error unsubscribing from gym:`, error.message);
      socket.emit('assistance:error', {
        message: 'Failed to unsubscribe from gym assistance',
        error: error.message
      });
    }
  });

  // Suscribirse a actualizaciones de rachas personales
  socket.on('streak:subscribe', () => {
    try {
      socket.join(`streak:user:${user.id_user_profile}`);
      socket.emit('streak:subscribed', {
        success: true,
        userId: user.id_user_profile,
        message: 'Subscribed to streak updates'
      });

      console.log(`[Assistance] User ${user.email} subscribed to streak updates`);
    } catch (error) {
      console.error(`[Assistance] Error subscribing to streak:`, error.message);
      socket.emit('assistance:error', {
        message: 'Failed to subscribe to streak updates',
        error: error.message
      });
    }
  });

  // Desuscribirse de actualizaciones de rachas
  socket.on('streak:unsubscribe', () => {
    try {
      socket.leave(`streak:user:${user.id_user_profile}`);
      socket.emit('streak:unsubscribed', {
        success: true,
        message: 'Unsubscribed from streak updates'
      });

      console.log(`[Assistance] User ${user.email} unsubscribed from streak updates`);
    } catch (error) {
      console.error(`[Assistance] Error unsubscribing from streak:`, error.message);
      socket.emit('assistance:error', {
        message: 'Failed to unsubscribe from streak updates',
        error: error.message
      });
    }
  });

  // Notificar registro de asistencia (la lógica real está en el servicio)
  socket.on('assistance:registered', (data) => {
    try {
      const { gymId, assistanceId } = data;

      if (!gymId) {
        socket.emit('assistance:error', {
          message: 'gymId is required'
        });
        return;
      }

      // Confirmar al usuario
      socket.emit('assistance:register-success', {
        success: true,
        assistanceId,
        gymId,
        timestamp: new Date().toISOString()
      });

      console.log(`[Assistance] User ${user.email} registered assistance for gym ${gymId}`);
    } catch (error) {
      console.error(`[Assistance] Error on assistance registration:`, error.message);
      socket.emit('assistance:error', {
        message: 'Failed to process assistance registration',
        error: error.message
      });
    }
  });
}

/**
 * Función auxiliar para emitir nueva asistencia a un gimnasio
 * @param {Server} io - Instancia de Socket.IO
 * @param {number} gymId - ID del gimnasio
 * @param {Object} assistanceData - Datos de la asistencia
 */
function emitNewAssistance(io, gymId, assistanceData) {
  try {
    io.to(`assistance:gym:${gymId}`).emit('assistance:new', {
      assistanceId: assistanceData.assistanceId,
      userId: assistanceData.userId,
      gymId,
      checkInTime: assistanceData.checkInTime,
      timestamp: new Date().toISOString()
    });
    console.log(`[Assistance] Emitted new assistance for gym ${gymId}`);
  } catch (error) {
    console.error(`[Assistance] Error emitting new assistance:`, error.message);
  }
}

/**
 * Función para emitir actualización de racha a un usuario
 * @param {Server} io - Instancia de Socket.IO
 * @param {number} userProfileId - ID del perfil de usuario
 * @param {Object} streakData - Datos de la racha
 */
function emitStreakUpdate(io, userProfileId, streakData) {
  try {
    io.to(`user:${userProfileId}`).emit('streak:updated', {
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      lastAssistanceDate: streakData.lastAssistanceDate,
      timestamp: new Date().toISOString()
    });

    // Si alcanzó un hito, enviar notificación especial
    if (streakData.milestone) {
      io.to(`user:${userProfileId}`).emit('streak:milestone', {
        milestone: streakData.milestone,
        currentStreak: streakData.currentStreak,
        message: streakData.milestoneMessage || `¡Felicitaciones! Alcanzaste ${streakData.milestone} días consecutivos`
      });
    }

    console.log(`[Assistance] Emitted streak update for user ${userProfileId}`);
  } catch (error) {
    console.error(`[Assistance] Error emitting streak update:`, error.message);
  }
}

/**
 * Función para notificar pérdida de racha
 * @param {Server} io - Instancia de Socket.IO
 * @param {number} userProfileId - ID del perfil de usuario
 * @param {Object} streakData - Datos de la racha perdida
 */
function emitStreakLost(io, userProfileId, streakData) {
  try {
    io.to(`user:${userProfileId}`).emit('streak:lost', {
      previousStreak: streakData.previousStreak,
      longestStreak: streakData.longestStreak,
      message: streakData.message || 'Has perdido tu racha actual',
      timestamp: new Date().toISOString()
    });
    console.log(`[Assistance] Emitted streak lost for user ${userProfileId}`);
  } catch (error) {
    console.error(`[Assistance] Error emitting streak lost:`, error.message);
  }
}

/**
 * Función para emitir cancelación de asistencia
 * @param {Server} io - Instancia de Socket.IO
 * @param {number} gymId - ID del gimnasio
 * @param {number} assistanceId - ID de la asistencia cancelada
 */
function emitAssistanceCancelled(io, gymId, assistanceId) {
  try {
    io.to(`assistance:gym:${gymId}`).emit('assistance:cancelled', {
      assistanceId,
      gymId,
      timestamp: new Date().toISOString()
    });
    console.log(`[Assistance] Emitted assistance cancelled for gym ${gymId}`);
  } catch (error) {
    console.error(`[Assistance] Error emitting assistance cancelled:`, error.message);
  }
}

module.exports = {
  register,
  emitNewAssistance,
  emitStreakUpdate,
  emitStreakLost,
  emitAssistanceCancelled
};
