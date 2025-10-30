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
    if (data.gymId) {
      io.to(`gym:${data.gymId}`).emit('presence:updated', {
        currentCount: data.currentCount,
        gymId: data.gymId,
        timestamp: data.timestamp
      });
    }
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
