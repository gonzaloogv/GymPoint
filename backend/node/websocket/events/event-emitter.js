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
  ATTENDANCE_RECORDED: 'attendance:recorded',

  // Reseñas y Ratings
  REVIEW_CREATED: 'review:created',
  REVIEW_UPDATED: 'review:updated',
  GYM_RATING_UPDATED: 'gym:rating:updated',

  // Logros
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  ACHIEVEMENT_CREATED: 'achievement:created', // Admin crea nuevo logro
  ACHIEVEMENT_UPDATED: 'achievement:updated', // Admin edita logro

  // Recompensas
  REWARD_EARNED: 'reward:earned',
  REWARD_CLAIMED: 'reward:claimed',
  REWARD_CREATED: 'reward:created', // Admin crea nueva recompensa
  REWARD_UPDATED: 'reward:updated', // Admin edita recompensa

  // Desafíos
  CHALLENGE_STARTED: 'challenge:started',
  CHALLENGE_PROGRESS: 'challenge:progress',
  CHALLENGE_COMPLETED: 'challenge:completed',

  // Sistema
  SYSTEM_ANNOUNCEMENT: 'system:announcement',

  // Solicitudes de gimnasios
  GYM_REQUEST_CREATED: 'gym:request:created',
  GYM_REQUEST_APPROVED: 'gym:request:approved',
  GYM_REQUEST_REJECTED: 'gym:request:rejected',
  GYM_REQUEST_STATUS_CHANGED: 'gym:request:status:changed',

  // Gimnasios
  GYM_CREATED: 'gym:created', // Nuevo gimnasio agregado (desde request aprobada o admin)
  GYM_UPDATED: 'gym:updated', // Gimnasio editado
  GYM_DELETED: 'gym:deleted', // Gimnasio eliminado

  // Ejercicios
  EXERCISE_CREATED: 'exercise:created', // Admin crea nuevo ejercicio
  EXERCISE_UPDATED: 'exercise:updated', // Admin edita ejercicio
  EXERCISE_DELETED: 'exercise:deleted', // Admin elimina ejercicio

  // Plantillas de rutinas
  ROUTINE_TEMPLATE_CREATED: 'routine:template:created', // Admin crea plantilla
  ROUTINE_TEMPLATE_UPDATED: 'routine:template:updated', // Admin edita plantilla
  ROUTINE_TEMPLATE_DELETED: 'routine:template:deleted', // Admin elimina plantilla

  // Gestión de usuarios (Admin)
  USER_SUBSCRIPTION_UPDATED: 'user:subscription:updated',
  USER_TOKENS_UPDATED: 'user:tokens:updated',
  USER_PROFILE_UPDATED: 'user:profile:updated',
  PROGRESS_WEEKLY_UPDATED: 'progress:weekly:updated',

  // Estadísticas de admin
  ADMIN_STATS_UPDATED: 'admin:stats:updated',
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
