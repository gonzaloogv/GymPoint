/**
 * Review WebSocket Handler
 * Maneja eventos de reviews y ratings en tiempo real
 */

const { appEvents, EVENTS } = require('../events/event-emitter');

/**
 * Registra todos los handlers de review
 * @param {Server} io - Instancia de Socket.IO
 */
function register(io) {
  console.log('[ReviewHandler] Registering review handlers...');

  // Handler para nueva review
  appEvents.on(EVENTS.REVIEW_CREATED, (data) => {
    console.log('[ReviewHandler] New review created:', data);
    emitNewReview(io, data);
  });

  // Handler para review actualizada
  appEvents.on(EVENTS.REVIEW_UPDATED, (data) => {
    console.log('[ReviewHandler] Review updated:', data);
    emitReviewUpdated(io, data);
  });

  // Handler para actualización de rating del gym
  appEvents.on(EVENTS.GYM_RATING_UPDATED, (data) => {
    console.log('[ReviewHandler] Gym rating updated:', data);
    emitRatingUpdated(io, data);
  });

  console.log('[ReviewHandler] Review handlers registered successfully');
}

/**
 * Emite evento de nueva review a todos los clientes suscritos al gym
 * @param {Server} io - Socket.IO instance
 * @param {Object} data - Review data
 */
function emitNewReview(io, data) {
  const { reviewId, gymId, userId, rating, title, comment } = data;

  // Emitir a la sala del gym
  io.to(`gym:${gymId}`).emit('review:new', {
    reviewId,
    gymId,
    userId,
    rating,
    title,
    comment,
    timestamp: new Date().toISOString(),
  });

  console.log(`[ReviewHandler] Emitted review:new to gym:${gymId}`);
}

/**
 * Emite evento de review actualizada
 * @param {Server} io - Socket.IO instance
 * @param {Object} data - Review data
 */
function emitReviewUpdated(io, data) {
  const { reviewId, gymId, userId, rating, title, comment } = data;

  // Emitir a la sala del gym
  io.to(`gym:${gymId}`).emit('review:updated', {
    reviewId,
    gymId,
    userId,
    rating,
    title,
    comment,
    timestamp: new Date().toISOString(),
  });

  console.log(`[ReviewHandler] Emitted review:updated to gym:${gymId}`);
}

/**
 * Emite evento de actualización de rating del gym
 * @param {Server} io - Socket.IO instance
 * @param {Object} data - Rating stats
 */
function emitRatingUpdated(io, data) {
  const { gymId, averageRating, totalReviews } = data;

  // Emitir a la sala del gym
  io.to(`gym:${gymId}`).emit('gym:rating-updated', {
    gymId,
    averageRating,
    totalReviews,
    timestamp: new Date().toISOString(),
  });

  console.log(`[ReviewHandler] Emitted gym:rating-updated to gym:${gymId} - ${averageRating} (${totalReviews} reviews)`);
}

module.exports = {
  register,
  emitNewReview,
  emitReviewUpdated,
  emitRatingUpdated,
};
