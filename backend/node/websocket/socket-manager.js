const { Server } = require('socket.io');
const { authenticateSocket } = require('./middlewares/auth.middleware');
const { appEvents, EVENTS } = require('./events/event-emitter');

// Variable global para acceder a la instancia de IO
let io = null;

/**
 * Inicializa el servidor de WebSocket
 * @param {http.Server} server - Servidor HTTP de Express
 * @returns {Server} Instancia de Socket.IO
 */
function initializeWebSocket(server) {
  // Configuración de CORS desde variables de entorno
  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : '*';

  io = new Server(server, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Aplicar middleware de autenticación
  io.use(authenticateSocket);

  // Manejador de conexiones
  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`[WebSocket] User connected: ${user.email} (ID: ${user.id_user_profile})`);

    // Unir al usuario a su room personal
    socket.join(`user:${user.id_user_profile}`);

    // Emitir evento de conexión exitosa
    socket.emit('connection:success', {
      message: 'Connected to GymPoint WebSocket',
      userId: user.id_user_profile,
      timestamp: new Date().toISOString()
    });

    // Registrar handlers
    registerNotificationHandlers(socket);
    registerPresenceHandlers(socket);
    registerAssistanceHandlers(socket);
    registerAdminHandlers(socket);
    registerUserHandlers(socket);

    // Manejador de desconexión
    socket.on('disconnect', (reason) => {
      console.log(`[WebSocket] User disconnected: ${user.email} - Reason: ${reason}`);
    });

    // Manejador de errores
    socket.on('error', (error) => {
      console.error(`[WebSocket] Socket error for user ${user.email}:`, error.message);
    });
  });

  // Registrar listeners de eventos de la aplicación
  registerAppEventListeners(io);

  console.log('[WebSocket] Socket.IO initialized successfully');
  return io;
}

/**
 * Registra los handlers de notificaciones
 */
function registerNotificationHandlers(socket) {
  const notificationHandlers = require('./handlers/notification.handler');
  notificationHandlers.register(socket, io);
}

/**
 * Registra los handlers de presencia
 */
function registerPresenceHandlers(socket) {
  const presenceHandlers = require('./handlers/presence.handler');
  presenceHandlers.register(socket, io);
}

/**
 * Registra los handlers de asistencias
 */
function registerAssistanceHandlers(socket) {
  const assistanceHandlers = require('./handlers/assistance.handler');
  assistanceHandlers.register(socket, io);
}

/**
 * Registra los handlers de administración
 */
function registerAdminHandlers(socket) {
  const adminHandlers = require('./handlers/admin.handler');
  adminHandlers.register(socket, io);
}

/**
 * Registra los handlers de usuario
 */
function registerUserHandlers(socket) {
  const userHandlers = require('./handlers/user.handler');
  userHandlers.register(socket, io);
}

/**
 * Registra listeners para eventos de la aplicación
 * Estos eventos son emitidos por los servicios existentes
 */
function registerAppEventListeners(io) {
  // Notificaciones
  appEvents.on(EVENTS.NOTIFICATION_CREATED, (data) => {
    io.to(`user:${data.userProfileId}`).emit('notification:new', data.notification);
  });

  // Asistencias
  appEvents.on(EVENTS.ASSISTANCE_REGISTERED, (data) => {
    if (data.gymId) {
      io.to(`gym:${data.gymId}`).emit('assistance:registered', {
        userId: data.userId,
        gymId: data.gymId,
        timestamp: data.timestamp
      });
    }
  });

  // Presencia
  appEvents.on(EVENTS.PRESENCE_UPDATED, (data) => {
    if (!data || typeof data.gymId !== 'number') {
      console.error('[WebSocket] Invalid payload for PRESENCE_UPDATED:', data);
      return;
    }
    io.to(`gym:${data.gymId}`).emit('presence:updated', {
      currentCount: data.currentCount,
      gymId: data.gymId,
      timestamp: data.timestamp
    });
  });

  // Rachas
  appEvents.on(EVENTS.STREAK_UPDATED, (data) => {
    io.to(`user:${data.userProfileId}`).emit('streak:updated', {
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
      timestamp: data.timestamp
    });
  });

  appEvents.on(EVENTS.STREAK_MILESTONE, (data) => {
    io.to(`user:${data.userProfileId}`).emit('streak:milestone', {
      milestone: data.milestone,
      currentStreak: data.currentStreak,
      message: data.message
    });
  });

  // Reseñas
  appEvents.on(EVENTS.REVIEW_CREATED, (data) => {
    if (data.gymId) {
      io.to(`gym:${data.gymId}`).emit('review:new', {
        reviewId: data.reviewId,
        gymId: data.gymId,
        userId: data.userId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        timestamp: new Date().toISOString()
      });
    }
  });

  appEvents.on(EVENTS.REVIEW_UPDATED, (data) => {
    if (data.gymId) {
      io.to(`gym:${data.gymId}`).emit('review:updated', {
        reviewId: data.reviewId,
        gymId: data.gymId,
        userId: data.userId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        timestamp: new Date().toISOString()
      });
    }
  });

  appEvents.on(EVENTS.GYM_RATING_UPDATED, (data) => {
    if (data.gymId) {
      io.to(`gym:${data.gymId}`).emit('gym:rating:updated', {
        gymId: data.gymId,
        averageRating: data.averageRating,
        totalReviews: data.totalReviews,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Logros
  appEvents.on(EVENTS.ACHIEVEMENT_UNLOCKED, (data) => {
    io.to(`user:${data.userProfileId}`).emit('achievement:unlocked', {
      achievementId: data.achievementId,
      name: data.name,
      description: data.description,
      points: data.points
    });
  });

  // Recompensas
  appEvents.on(EVENTS.REWARD_EARNED, (data) => {
    io.to(`user:${data.userProfileId}`).emit('reward:earned', {
      rewardId: data.rewardId,
      name: data.name,
      type: data.type
    });
  });

  // Anuncios del sistema
  appEvents.on(EVENTS.SYSTEM_ANNOUNCEMENT, (data) => {
    io.emit('system:announcement', {
      message: data.message,
      priority: data.priority,
      timestamp: data.timestamp
    });
  });

  // Solicitudes de gimnasios (Admin)
  appEvents.on(EVENTS.GYM_REQUEST_CREATED, (data) => {
    console.log('🔥🔥🔥 [Socket Manager] GYM_REQUEST_CREATED event received! 🔥🔥🔥');
    console.log('[Socket Manager] Gym Request ID:', data.gymRequest?.id_gym_request);
    console.log('[Socket Manager] Gym Request Name:', data.gymRequest?.name);
    console.log('[Socket Manager] Emitting to room: admin:gym-requests');

    io.to('admin:gym-requests').emit('gym:request:created', {
      gymRequest: data.gymRequest,
      timestamp: data.timestamp
    });

    console.log('[Socket Manager] ✅ Event emitted successfully!');
  });

  appEvents.on(EVENTS.GYM_REQUEST_APPROVED, (data) => {
    io.to('admin:gym-requests').emit('gym:request:approved', {
      requestId: data.requestId,
      gymId: data.gymId,
      gymRequest: data.gymRequest,
      gym: data.gym,
      timestamp: data.timestamp
    });
  });

  appEvents.on(EVENTS.GYM_REQUEST_REJECTED, (data) => {
    io.to('admin:gym-requests').emit('gym:request:rejected', {
      requestId: data.requestId,
      gymRequest: data.gymRequest,
      reason: data.reason,
      timestamp: data.timestamp
    });
  });

  // Gestión de usuarios (enviado al usuario específico)
  appEvents.on(EVENTS.USER_TOKENS_UPDATED, (data) => {
    if (!data || typeof data.userId !== 'number' || typeof data.newBalance !== 'number') {
      console.error('[WebSocket] Invalid payload for USER_TOKENS_UPDATED:', data);
      return;
    }
    io.to(`user:${data.userId}`).emit('user:tokens:updated', {
      newBalance: data.newBalance,
      previousBalance: data.previousBalance,
      delta: data.delta,
      reason: data.reason,
      timestamp: data.timestamp
    });

    // También emitir a room de tokens si está suscrito
    io.to(`user-tokens:${data.userId}`).emit('user:tokens:updated', {
      newBalance: data.newBalance,
      previousBalance: data.previousBalance,
      delta: data.delta,
      reason: data.reason,
      timestamp: data.timestamp
    });

    io.to('admin:user-management').emit('user:tokens:updated', {
      userId: data.userId,
      newBalance: data.newBalance,
      previousBalance: data.previousBalance,
      delta: data.delta,
      reason: data.reason,
      refType: data.refType,
      refId: data.refId,
      ledgerEntry: data.ledgerEntry,
      timestamp: data.timestamp
    });
  });

  appEvents.on(EVENTS.USER_SUBSCRIPTION_UPDATED, (data) => {
    if (!data || typeof data.userId !== 'number' || typeof data.newSubscription !== 'string') {
      console.error('[WebSocket] Invalid payload for USER_SUBSCRIPTION_UPDATED:', data);
      return;
    }
    io.to(`user:${data.userId}`).emit('user:subscription:updated', {
      previousSubscription: data.previousSubscription,
      newSubscription: data.newSubscription,
      isPremium: data.isPremium,
      premiumSince: data.premiumSince,
      premiumExpires: data.premiumExpires,
      timestamp: data.timestamp
    });

    io.to(`user-profile:${data.userId}`).emit('user:subscription:updated', {
      previousSubscription: data.previousSubscription,
      newSubscription: data.newSubscription,
      isPremium: data.isPremium,
      premiumSince: data.premiumSince,
      premiumExpires: data.premiumExpires,
      timestamp: data.timestamp
    });

    io.to('admin:user-management').emit('user:subscription:changed', {
      userId: data.userId,
      accountId: data.accountId,
      newSubscription: data.newSubscription,
      isPremium: data.isPremium,
      timestamp: data.timestamp
    });
  });

  appEvents.on(EVENTS.USER_PROFILE_UPDATED, (data) => {
    if (!data || typeof data.userId !== 'number') {
      console.error('[WebSocket] Invalid payload for USER_PROFILE_UPDATED:', data);
      return;
    }
    io.to(`user:${data.userId}`).emit('user:profile:updated', {
      profile: data.profile,
      timestamp: data.timestamp
    });

    io.to(`user-profile:${data.userId}`).emit('user:profile:updated', {
      profile: data.profile,
      timestamp: data.timestamp
    });
  });

  appEvents.on(EVENTS.USER_ACCOUNT_STATUS_UPDATED, (data) => {
    if (!data || typeof data.accountId !== 'number') {
      console.error('[WebSocket] Invalid payload for USER_ACCOUNT_STATUS_UPDATED:', data);
      return;
    }
    io.to('admin:user-management').emit('user:status:updated', {
      accountId: data.accountId,
      userId: data.userId,
      is_active: data.isActive,
      email: data.email,
      timestamp: data.timestamp,
    });
  });

  appEvents.on(EVENTS.USER_CREATED, (data) => {
    if (!data || !data.user) {
      console.error('[WebSocket] Invalid payload for USER_CREATED:', data);
      return;
    }
    io.to('admin:user-management').emit('user:created', {
      user: data.user,
      timestamp: data.timestamp || new Date().toISOString(),
    });
  });

  appEvents.on(EVENTS.PROGRESS_WEEKLY_UPDATED, (data) => {
    if (!data || typeof data.userId !== 'number' || typeof data.goal !== 'number') {
      console.error('[WebSocket] Invalid payload for PROGRESS_WEEKLY_UPDATED:', data);
      return;
    }
    io.to(`user:${data.userId}`).emit('progress:weekly:updated', {
      goal: data.goal,
      current: data.current,
      achieved: data.achieved,
      percentage: data.percentage,
      weekStart: data.weekStart,
      weekNumber: data.weekNumber,
      year: data.year,
      timestamp: data.timestamp,
    });
  });

  appEvents.on(EVENTS.ATTENDANCE_RECORDED, (data) => {
    if (!data || typeof data.userId !== 'number' || typeof data.gymId !== 'number') {
      console.error('[WebSocket] Invalid payload for ATTENDANCE_RECORDED:', data);
      return;
    }
    io.to(`user:${data.userId}`).emit('attendance:recorded', {
      attendanceId: data.attendanceId,
      gymId: data.gymId,
      tokensAwarded: data.tokensAwarded,
      newBalance: data.newBalance,
      streak: data.streak,
      timestamp: data.timestamp,
    });
  });

  // Estadísticas de admin
  appEvents.on(EVENTS.ADMIN_STATS_UPDATED, (data) => {
    io.to('admin:stats').emit('admin:stats:updated', {
      stats: data.stats,
      timestamp: data.timestamp
    });
  });

  // ========== EVENTOS BROADCAST (TODOS LOS USUARIOS MOBILE) ==========

  // Gimnasios - Cuando se crea/edita/elimina un gimnasio, todos deben actualizar
  appEvents.on(EVENTS.GYM_CREATED, (data) => {
    console.log('🏋️ [Socket Manager] GYM_CREATED - Broadcasting to all users');
    io.emit('data:gyms:updated', {
      action: 'created',
      gym: data.gym,
      timestamp: data.timestamp || new Date().toISOString()
    });
  });

  appEvents.on(EVENTS.GYM_UPDATED, (data) => {
    console.log('🏋️ [Socket Manager] GYM_UPDATED - Broadcasting to all users');
    io.emit('data:gyms:updated', {
      action: 'updated',
      gym: data.gym,
      timestamp: data.timestamp || new Date().toISOString()
    });
  });

  appEvents.on(EVENTS.GYM_DELETED, (data) => {
    console.log('🏋️ [Socket Manager] GYM_DELETED - Broadcasting to all users');
    io.emit('data:gyms:updated', {
      action: 'deleted',
      gymId: data.gymId,
      timestamp: data.timestamp || new Date().toISOString()
    });
  });

  // Logros - Cuando admin crea/edita logros
  appEvents.on(EVENTS.ACHIEVEMENT_CREATED, (data) => {
    console.log('🏆 [Socket Manager] ACHIEVEMENT_CREATED - Broadcasting to all users');
    io.emit('data:achievements:updated', {
      action: 'created',
      achievement: data.achievement,
      timestamp: data.timestamp || new Date().toISOString()
    });
  });

  appEvents.on(EVENTS.ACHIEVEMENT_UPDATED, (data) => {
    console.log('🏆 [Socket Manager] ACHIEVEMENT_UPDATED - Broadcasting to all users');
    io.emit('data:achievements:updated', {
      action: 'updated',
      achievement: data.achievement,
      timestamp: data.timestamp || new Date().toISOString()
    });
  });

  // Recompensas - Cuando admin crea/edita recompensas
  appEvents.on(EVENTS.REWARD_CREATED, (data) => {
    console.log('🎁 [Socket Manager] REWARD_CREATED - Broadcasting to all users');
    io.emit('data:rewards:updated', {
      action: 'created',
      reward: data.reward,
      timestamp: data.timestamp || new Date().toISOString()
    });
  });

  appEvents.on(EVENTS.REWARD_UPDATED, (data) => {
    console.log('🎁 [Socket Manager] REWARD_UPDATED - Broadcasting to all users');
    io.emit('data:rewards:updated', {
      action: 'updated',
      reward: data.reward,
      timestamp: data.timestamp || new Date().toISOString()
    });
  });

  // Ejercicios - Cuando admin crea/edita/elimina ejercicios
  appEvents.on(EVENTS.EXERCISE_CREATED, (data) => {
    console.log('💪 [Socket Manager] EXERCISE_CREATED - Broadcasting to all users');
    io.emit('data:exercises:updated', {
      action: 'created',
      exercise: data.exercise,
      timestamp: data.timestamp || new Date().toISOString()
    });
  });

  appEvents.on(EVENTS.EXERCISE_UPDATED, (data) => {
    console.log('💪 [Socket Manager] EXERCISE_UPDATED - Broadcasting to all users');
    io.emit('data:exercises:updated', {
      action: 'updated',
      exercise: data.exercise,
      timestamp: data.timestamp || new Date().toISOString()
    });
  });

  appEvents.on(EVENTS.EXERCISE_DELETED, (data) => {
    console.log('💪 [Socket Manager] EXERCISE_DELETED - Broadcasting to all users');
    io.emit('data:exercises:updated', {
      action: 'deleted',
      exerciseId: data.exerciseId,
      timestamp: data.timestamp || new Date().toISOString()
    });
  });

  // Plantillas de rutinas - Cuando admin crea/edita/elimina plantillas
  appEvents.on(EVENTS.ROUTINE_TEMPLATE_CREATED, (data) => {
    console.log('📋 [Socket Manager] ROUTINE_TEMPLATE_CREATED - Broadcasting to all users');
    io.emit('data:routine-templates:updated', {
      action: 'created',
      template: data.template,
      timestamp: data.timestamp || new Date().toISOString()
    });
  });

  appEvents.on(EVENTS.ROUTINE_TEMPLATE_UPDATED, (data) => {
    console.log('📋 [Socket Manager] ROUTINE_TEMPLATE_UPDATED - Broadcasting to all users');
    io.emit('data:routine-templates:updated', {
      action: 'updated',
      template: data.template,
      timestamp: data.timestamp || new Date().toISOString()
    });
  });

  appEvents.on(EVENTS.ROUTINE_TEMPLATE_DELETED, (data) => {
    console.log('📋 [Socket Manager] ROUTINE_TEMPLATE_DELETED - Broadcasting to all users');
    io.emit('data:routine-templates:updated', {
      action: 'deleted',
      templateId: data.templateId,
      timestamp: data.timestamp || new Date().toISOString()
    });
  });

  console.log('[WebSocket] Application event listeners registered');
}

/**
 * Obtiene la instancia de Socket.IO
 * @returns {Server|null} Instancia de IO o null si no está inicializado
 */
function getIO() {
  if (!io) {
    console.warn('[WebSocket] Socket.IO not initialized yet');
  }
  return io;
}

/**
 * Emite un evento a un usuario específico
 * @param {number} userProfileId - ID del perfil de usuario
 * @param {string} eventName - Nombre del evento
 * @param {Object} data - Datos a enviar
 */
function emitToUser(userProfileId, eventName, data) {
  if (io) {
    io.to(`user:${userProfileId}`).emit(eventName, data);
  }
}

/**
 * Emite un evento a un gimnasio específico
 * @param {number} gymId - ID del gimnasio
 * @param {string} eventName - Nombre del evento
 * @param {Object} data - Datos a enviar
 */
function emitToGym(gymId, eventName, data) {
  if (io) {
    io.to(`gym:${gymId}`).emit(eventName, data);
  }
}

/**
 * Emite un evento a todos los usuarios conectados
 * @param {string} eventName - Nombre del evento
 * @param {Object} data - Datos a enviar
 */
function emitToAll(eventName, data) {
  if (io) {
    io.emit(eventName, data);
  }
}

module.exports = {
  initializeWebSocket,
  getIO,
  emitToUser,
  emitToGym,
  emitToAll
};
