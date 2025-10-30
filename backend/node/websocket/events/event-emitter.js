const EventEmitter = require('events');

/**
 * Event Emitter central para comunicación entre servicios y WebSocket
 * Permite mantener separación de concerns sin modificar lógica existente
 */
class AppEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(20); // Aumentar límite para múltiples listeners
  }
}

const appEvents = new AppEventEmitter();

/**
 * Tipos de eventos del sistema
 */
const EVENTS = {
  // Notificaciones
  NOTIFICATION_CREATED: 'notification:created',
  NOTIFICATION_READ: 'notification:read',

  // Asistencias y Check-ins
  ASSISTANCE_REGISTERED: 'assistance:registered',
  ASSISTANCE_CANCELLED: 'assistance:cancelled',

  // Presencia en gimnasios
  PRESENCE_CHECKIN: 'presence:checkin',
  PRESENCE_CHECKOUT: 'presence:checkout',
  PRESENCE_UPDATED: 'presence:updated',

  // Rachas (Streaks)
  STREAK_UPDATED: 'streak:updated',
  STREAK_LOST: 'streak:lost',
  STREAK_MILESTONE: 'streak:milestone',

  // Reseñas y Ratings
  REVIEW_CREATED: 'review:created',
  REVIEW_UPDATED: 'review:updated',
  GYM_RATING_UPDATED: 'gym:rating:updated',

  // Logros
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',

  // Recompensas
  REWARD_EARNED: 'reward:earned',
  REWARD_CLAIMED: 'reward:claimed',

  // Desafíos
  CHALLENGE_STARTED: 'challenge:started',
  CHALLENGE_PROGRESS: 'challenge:progress',
  CHALLENGE_COMPLETED: 'challenge:completed',

  // Sistema
  SYSTEM_ANNOUNCEMENT: 'system:announcement',
};

/**
 * Helper para emitir eventos de forma segura
 * @param {string} eventName - Nombre del evento
 * @param {Object} data - Datos del evento
 */
function emitEvent(eventName, data) {
  try {
    appEvents.emit(eventName, data);
    console.log(`[EventEmitter] Event emitted: ${eventName}`);
  } catch (error) {
    console.error(`[EventEmitter] Error emitting event ${eventName}:`, error.message);
  }
}

module.exports = {
  appEvents,
  EVENTS,
  emitEvent
};
