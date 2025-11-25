/**
 * Commands para el dominio Gym Reviews (Reseñas y Valoraciones)
 *
 * Los Commands son objetos puros (POJOs) que representan una intención
 * de modificar el estado del sistema. No contienen lógica de negocio.
 *
 * Cobertura:
 * - GymReview: Reseñas de usuarios a gimnasios
 * - ReviewHelpful: Votos de utilidad en reseñas
 * - GymRatingStats: Estadísticas agregadas (se actualizan automáticamente)
 */

/**
 * Command para crear una reseña de gimnasio
 *
 * Reglas:
 * - Usuario debe estar autenticado
 * - Rating general: 1-5 (con decimales)
 * - Ratings específicos opcionales: 1-5 (enteros)
 * - Solo 1 reseña por usuario por gimnasio
 *
 * @typedef {Object} CreateGymReviewCommand
 * @property {number} userId - ID del usuario que reseña
 * @property {number} gymId - ID del gimnasio
 * @property {number} rating - Rating general (1.0 - 5.0)
 * @property {string} [title] - Título de la reseña (max 100 chars)
 * @property {string} [comment] - Comentario de la reseña
 * @property {number} [cleanliness_rating] - Rating de limpieza (1-5)
 * @property {number} [equipment_rating] - Rating de equipamiento (1-5)
 * @property {number} [staff_rating] - Rating de staff (1-5)
 * @property {number} [facilities_rating] - Rating de instalaciones (1-5)
 * @property {number} [value_rating] - Rating de relación calidad-precio (1-5)
 */
class CreateGymReviewCommand {
  constructor({
    userId,
    gymId,
    rating,
    title = null,
    comment = null,
    cleanliness_rating = null,
    equipment_rating = null,
    staff_rating = null,
    facilities_rating = null,
    value_rating = null,
  }) {
    this.userId = userId;
    this.gymId = gymId;
    this.rating = rating;
    this.title = title;
    this.comment = comment;
    this.cleanliness_rating = cleanliness_rating;
    this.equipment_rating = equipment_rating;
    this.staff_rating = staff_rating;
    this.facilities_rating = facilities_rating;
    this.value_rating = value_rating;
  }
}

/**
 * Command para actualizar una reseña de gimnasio
 *
 * Reglas:
 * - Solo el autor puede actualizar su reseña
 *
 * @typedef {Object} UpdateGymReviewCommand
 * @property {number} reviewId - ID de la reseña
 * @property {number} userId - ID del usuario (para validar autoría)
 * @property {number} [rating] - Rating general
 * @property {string} [title] - Título
 * @property {string} [comment] - Comentario
 * @property {number} [cleanliness_rating] - Rating de limpieza
 * @property {number} [equipment_rating] - Rating de equipamiento
 * @property {number} [staff_rating] - Rating de staff
 * @property {number} [facilities_rating] - Rating de instalaciones
 * @property {number} [value_rating] - Rating de valor
 */
class UpdateGymReviewCommand {
  constructor({
    reviewId,
    userId,
    rating,
    title,
    comment,
    cleanliness_rating,
    equipment_rating,
    staff_rating,
    facilities_rating,
    value_rating,
  }) {
    this.reviewId = reviewId;
    this.userId = userId;
    this.rating = rating;
    this.title = title;
    this.comment = comment;
    this.cleanliness_rating = cleanliness_rating;
    this.equipment_rating = equipment_rating;
    this.staff_rating = staff_rating;
    this.facilities_rating = facilities_rating;
    this.value_rating = value_rating;
  }
}

/**
 * Command para eliminar una reseña
 *
 * Reglas:
 * - Solo el autor o un admin pueden eliminar
 *
 * @typedef {Object} DeleteGymReviewCommand
 * @property {number} reviewId - ID de la reseña
 * @property {number} userId - ID del usuario (autor o admin)
 * @property {boolean} isAdmin - Si es un admin el que elimina
 * @property {string} [deleteReason] - Razón de eliminación (si es admin)
 */
class DeleteGymReviewCommand {
  constructor({ reviewId, userId, isAdmin = false, deleteReason = null }) {
    this.reviewId = reviewId;
    this.userId = userId;
    this.isAdmin = isAdmin;
    this.deleteReason = deleteReason;
  }
}

/**
 * Command para marcar una reseña como útil
 *
 * Reglas:
 * - Usuario autenticado
 * - 1 voto por usuario por reseña
 *
 * @typedef {Object} MarkReviewHelpfulCommand
 * @property {number} reviewId - ID de la reseña
 * @property {number} userId - ID del usuario
 * @property {boolean} isHelpful - true = útil, false = no útil
 */
class MarkReviewHelpfulCommand {
  constructor({ reviewId, userId, isHelpful }) {
    this.reviewId = reviewId;
    this.userId = userId;
    this.isHelpful = isHelpful;
  }
}

/**
 * Command para remover voto de útil de una reseña
 *
 * @typedef {Object} RemoveReviewHelpfulCommand
 * @property {number} reviewId - ID de la reseña
 * @property {number} userId - ID del usuario
 */
class RemoveReviewHelpfulCommand {
  constructor({ reviewId, userId }) {
    this.reviewId = reviewId;
    this.userId = userId;
  }
}

/**
 * Command para reportar una reseña (abuso, spam, etc.)
 *
 * @typedef {Object} ReportReviewCommand
 * @property {number} reviewId - ID de la reseña
 * @property {number} userId - ID del usuario que reporta
 * @property {string} reason - Razón del reporte
 * @property {string} [details] - Detalles adicionales
 */
class ReportReviewCommand {
  constructor({ reviewId, userId, reason, details = null }) {
    this.reviewId = reviewId;
    this.userId = userId;
    this.reason = reason;
    this.details = details;
  }
}

module.exports = {
  CreateGymReviewCommand,
  UpdateGymReviewCommand,
  DeleteGymReviewCommand,
  MarkReviewHelpfulCommand,
  RemoveReviewHelpfulCommand,
  ReportReviewCommand,
};
