/**
 * Queries para el dominio Gym Reviews (Reseñas)
 *
 * Las Queries son objetos puros (POJOs) que representan una solicitud
 * de lectura de datos. No modifican el estado del sistema.
 *
 * Cobertura:
 * - GymReview: Reseñas de usuarios
 * - ReviewHelpful: Votos de utilidad
 * - GymRatingStats: Estadísticas agregadas
 */

/**
 * Query para listar reseñas de un gimnasio con paginación
 *
 * @typedef {Object} ListGymReviewsQuery
 * @property {number} gymId - ID del gimnasio
 * @property {number} [page=1] - Número de página
 * @property {number} [limit=20] - Cantidad por página
 * @property {string} [sortBy='created_at'] - Campo para ordenar (created_at, rating, helpful_count)
 * @property {string} [order='DESC'] - Orden (ASC, DESC)
 * @property {number} [min_rating] - Rating mínimo (filtro)
 * @property {number} [max_rating] - Rating máximo (filtro)
 * @property {boolean} [with_comment_only=false] - Solo reseñas con comentario
 * @property {number} [userId] - ID del usuario (para marcar si votó útil)
 */
class ListGymReviewsQuery {
  constructor({
    gymId,
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    order = 'DESC',
    min_rating = null,
    max_rating = null,
    with_comment_only = false,
    userId = null,
  }) {
    this.gymId = gymId;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.order = order;
    this.min_rating = min_rating;
    this.max_rating = max_rating;
    this.with_comment_only = with_comment_only;
    this.userId = userId;
  }
}

/**
 * Query para obtener una reseña específica
 *
 * @typedef {Object} GetGymReviewByIdQuery
 * @property {number} reviewId - ID de la reseña
 * @property {number} [userId] - ID del usuario (para marcar si votó útil)
 */
class GetGymReviewByIdQuery {
  constructor({ reviewId, userId = null }) {
    this.reviewId = reviewId;
    this.userId = userId;
  }
}

/**
 * Query para obtener estadísticas de rating de un gimnasio
 *
 * @typedef {Object} GetGymRatingStatsQuery
 * @property {number} gymId - ID del gimnasio
 */
class GetGymRatingStatsQuery {
  constructor({ gymId }) {
    this.gymId = gymId;
  }
}

/**
 * Query para obtener reseñas de un usuario
 *
 * @typedef {Object} ListUserReviewsQuery
 * @property {number} userId - ID del usuario
 * @property {number} [page=1] - Número de página
 * @property {number} [limit=20] - Cantidad por página
 * @property {string} [sortBy='created_at'] - Campo para ordenar
 * @property {string} [order='DESC'] - Orden
 */
class ListUserReviewsQuery {
  constructor({
    userId,
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    order = 'DESC',
  }) {
    this.userId = userId;
    this.page = page;
    this.limit = limit;
    this.sortBy = sortBy;
    this.order = order;
  }
}

/**
 * Query para verificar si un usuario ya reseñó un gimnasio
 *
 * @typedef {Object} HasUserReviewedGymQuery
 * @property {number} userId - ID del usuario
 * @property {number} gymId - ID del gimnasio
 */
class HasUserReviewedGymQuery {
  constructor({ userId, gymId }) {
    this.userId = userId;
    this.gymId = gymId;
  }
}

/**
 * Query para obtener reseñas reportadas (solo admin)
 *
 * @typedef {Object} ListReportedReviewsQuery
 * @property {number} [page=1] - Número de página
 * @property {number} [limit=20] - Cantidad por página
 * @property {string} [status='pending'] - Estado del reporte (pending, resolved, dismissed)
 */
class ListReportedReviewsQuery {
  constructor({ page = 1, limit = 20, status = 'pending' }) {
    this.page = page;
    this.limit = limit;
    this.status = status;
  }
}

/**
 * Query para obtener distribución de ratings de un gimnasio
 *
 * @typedef {Object} GetGymRatingDistributionQuery
 * @property {number} gymId - ID del gimnasio
 */
class GetGymRatingDistributionQuery {
  constructor({ gymId }) {
    this.gymId = gymId;
  }
}

module.exports = {
  ListGymReviewsQuery,
  GetGymReviewByIdQuery,
  GetGymRatingStatsQuery,
  ListUserReviewsQuery,
  HasUserReviewedGymQuery,
  ListReportedReviewsQuery,
  GetGymRatingDistributionQuery,
};
