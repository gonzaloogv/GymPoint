/**
 * Gym Review Service - Lote 4
 * Maneja reseñas de gimnasios usando Commands/Queries
 */

const sequelize = require('../config/database');
const {
  gymReviewRepository,
  gymRepository,
  userProfileRepository,
} = require('../infra/db/repositories');
const { NotFoundError, ConflictError, BusinessError } = require('../utils/errors');
const tokenLedgerService = require('./token-ledger-service');
const achievementService = require('./achievement-service');
const { processUnlockResults } = require('./achievement-side-effects');
const { TOKENS, TOKEN_REASONS } = require('../config/constants');
const { emitEvent, EVENTS } = require('../websocket/events/event-emitter');

const REVIEW_TOKENS = Number.isFinite(TOKENS.REVIEW) ? TOKENS.REVIEW : 0;
const REVIEW_TOKEN_REASON = TOKEN_REASONS.REVIEW_SUBMITTED || 'REVIEW_SUBMITTED';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Recalcula las estadísticas de rating del gimnasio
 */
async function recalculateStats(gymId, transaction) {
  // La lógica de recalcular stats está en el repositorio como upsertRatingStats
  // Aquí llamamos al repositorio con los datos agregados
  const reviews = await gymReviewRepository.findReviewsByGymId({
    gymId,
    pagination: { limit: 10000 }, // Obtener todas las reviews para calcular stats
    options: { transaction },
  });

  if (!reviews.items || reviews.items.length === 0) {
    // No hay reviews, resetear stats
    await gymReviewRepository.upsertRatingStats(
      {
        id_gym: gymId,
        avg_rating: 0,
        total_reviews: 0,
        rating_5_count: 0,
        rating_4_count: 0,
        rating_3_count: 0,
        rating_2_count: 0,
        rating_1_count: 0,
        avg_cleanliness: 0,
        avg_equipment: 0,
        avg_staff: 0,
        avg_value: 0,
        last_review_date: null,
      },
      { transaction }
    );
    return;
  }

  // Calcular estadísticas
  let totalRating = 0;
  let totalCleanliness = 0;
  let totalEquipment = 0;
  let totalStaff = 0;
  let totalValue = 0;
  let countCleanliness = 0;
  let countEquipment = 0;
  let countStaff = 0;
  let countValue = 0;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let lastReviewDate = null;

  reviews.items.forEach((review) => {
    totalRating += review.rating;
    const roundedRating = Math.round(review.rating);
    if (roundedRating >= 1 && roundedRating <= 5) {
      ratingCounts[roundedRating]++;
    }

    if (review.cleanliness_rating) {
      totalCleanliness += review.cleanliness_rating;
      countCleanliness++;
    }
    if (review.equipment_rating) {
      totalEquipment += review.equipment_rating;
      countEquipment++;
    }
    if (review.staff_rating) {
      totalStaff += review.staff_rating;
      countStaff++;
    }
    if (review.value_rating) {
      totalValue += review.value_rating;
      countValue++;
    }

    if (!lastReviewDate || new Date(review.created_at) > new Date(lastReviewDate)) {
      lastReviewDate = review.created_at;
    }
  });

  const totalReviews = reviews.items.length;

  const stats = {
    id_gym: gymId,
    avg_rating: (totalRating / totalReviews).toFixed(2),
    total_reviews: totalReviews,
    rating_5_count: ratingCounts[5],
    rating_4_count: ratingCounts[4],
    rating_3_count: ratingCounts[3],
    rating_2_count: ratingCounts[2],
    rating_1_count: ratingCounts[1],
    avg_cleanliness: countCleanliness > 0 ? (totalCleanliness / countCleanliness).toFixed(2) : 0,
    avg_equipment: countEquipment > 0 ? (totalEquipment / countEquipment).toFixed(2) : 0,
    avg_staff: countStaff > 0 ? (totalStaff / countStaff).toFixed(2) : 0,
    avg_value: countValue > 0 ? (totalValue / countValue).toFixed(2) : 0,
    last_review_date: lastReviewDate,
  };

  await gymReviewRepository.upsertRatingStats(stats, { transaction });
}

// ============================================================================
// GYM REVIEWS
// ============================================================================

/**
 * Lista las reseñas de un gimnasio
 * @param {ListGymReviewsQuery} query
 * @returns {Promise<Object>} Paginación de reseñas
 */
async function listGymReviews(query) {
  // Verificar que el gimnasio existe (solo si se especificó gymId)
  if (query.gymId) {
    const gym = await gymRepository.findById(query.gymId);
    if (!gym) {
      throw new NotFoundError('Gimnasio no encontrado');
    }
  }

  const filters = {};
  if (query.min_rating) filters.min_rating = query.min_rating;
  if (query.max_rating) filters.max_rating = query.max_rating;
  if (query.with_comment_only) filters.with_comment_only = query.with_comment_only;

  const pagination = {
    page: query.page || 1,
    limit: query.limit || 20,
  };

  const sort = {
    sortBy: query.sortBy || 'created_at',
    order: query.order || 'DESC',
  };

  return gymReviewRepository.findReviewsByGymId({
    gymId: query.gymId,
    filters,
    pagination,
    sort,
  });
}

/**
 * Obtiene una reseña específica
 * @param {GetGymReviewQuery} query
 * @returns {Promise<Object|null>} Reseña (POJO)
 */
async function getGymReview(query) {
  return gymReviewRepository.findReviewById(query.reviewId);
}

/**
 * Lista las reseñas de un usuario
 * @param {GetUserReviewsQuery} query
 * @returns {Promise<Object>} Paginación de reseñas
 */
async function getUserReviews(query) {
  const pagination = {
    page: query.page || 1,
    limit: query.limit || 20,
  };

  const sort = {
    sortBy: query.sortBy || 'created_at',
    order: query.order || 'DESC',
  };

  return gymReviewRepository.findReviewsByUserId({
    userId: query.userId,
    pagination,
    sort,
  });
}

/**
 * Crea una nueva reseña
 * @param {CreateGymReviewCommand} command
 * @returns {Promise<Object>} Reseña creada (POJO)
 */
async function createGymReview(command) {
  const transaction = await sequelize.transaction();
  try {
    // Validar que el gimnasio existe
    const gym = await gymRepository.findById(command.gymId, { transaction });
    if (!gym) {
      throw new NotFoundError('Gimnasio no encontrado');
    }

    // Validar que el usuario existe
    const user = await userProfileRepository.findById(command.userId, { transaction });
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Verificar que no exista una reseña previa
    const existing = await gymReviewRepository.findReviewByUserAndGym(
      command.userId,
      command.gymId,
      { transaction }
    );

    if (existing) {
      throw new ConflictError('Ya has dejado una reseña para este gimnasio');
    }

    // Crear la reseña
    const payload = {
      id_user_profile: command.userId,
      id_gym: command.gymId,
      rating: command.rating,
      title: command.title,
      comment: command.comment,
      cleanliness_rating: command.cleanliness_rating,
      equipment_rating: command.equipment_rating,
      staff_rating: command.staff_rating,
      value_rating: command.value_rating,
    };

    const review = await gymReviewRepository.createReview(payload, { transaction });

    // Recalcular estadísticas
    await recalculateStats(command.gymId, transaction);

    // Obtener las stats actualizadas para emitir en el evento
    const updatedStats = await gymReviewRepository.findRatingStatsByGymId(command.gymId, { transaction });

    // Otorgar tokens si está configurado - SOLO LA PRIMERA VEZ (primera review del usuario)
    if (REVIEW_TOKENS > 0) {
      // Verificar si el usuario YA recibió tokens por alguna review anteriormente
      const { TokenLedger } = require('../models');
      const existingReviewTokens = await TokenLedger.findOne({
        where: {
          id_user_profile: command.userId,
          ref_type: 'gym_review'
        },
        transaction
      });

      if (!existingReviewTokens) {
        // Primera review del usuario - otorgar tokens
        await tokenLedgerService.registrarMovimiento({
          userId: command.userId,
          delta: REVIEW_TOKENS,
          reason: REVIEW_TOKEN_REASON,
          refType: 'gym_review',
          refId: review.id_review,
          transaction,
        });
      }
    }

    await transaction.commit();

    // Emitir evento WebSocket de nueva review
    emitEvent(EVENTS.REVIEW_CREATED, {
      reviewId: review.id_review,
      gymId: command.gymId,
      userId: command.userId,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
    });

    // Emitir evento de actualización de rating del gym
    if (updatedStats) {
      emitEvent(EVENTS.GYM_RATING_UPDATED, {
        gymId: command.gymId,
        averageRating: parseFloat(updatedStats.avg_rating),
        totalReviews: updatedStats.total_reviews,
      });
    }

    // Sincronizar achievements de tokens DESPUÉS del commit para evitar deadlocks
    try {
      const achievementResults = await achievementService.syncAllAchievementsForUser(command.userId, {
        categories: ['TOKEN']
      });
      await processUnlockResults(command.userId, achievementResults);
    } catch (error) {
      console.error(`[review-service.createGymReview] Error sincronizando achievements:`, error.message);
      // No lanzamos el error para no bloquear la creación de la review
    }

    return review;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Actualiza una reseña existente
 * @param {UpdateGymReviewCommand} command
 * @returns {Promise<Object>} Reseña actualizada (POJO)
 */
async function updateGymReview(command) {
  const transaction = await sequelize.transaction();
  try {
    const review = await gymReviewRepository.findReviewById(command.reviewId, { transaction });
    if (!review) {
      throw new NotFoundError('Reseña no encontrada');
    }

    // Verificar permisos (solo el autor o admin)
    if (!command.isAdmin && review.id_user_profile !== command.userId) {
      throw new BusinessError('No puedes actualizar reseñas de otros usuarios', 'REVIEW_FORBIDDEN');
    }

    const payload = {};
    if (command.rating !== undefined) payload.rating = command.rating;
    if (command.title !== undefined) payload.title = command.title;
    if (command.comment !== undefined) payload.comment = command.comment;
    if (command.cleanliness_rating !== undefined) payload.cleanliness_rating = command.cleanliness_rating;
    if (command.equipment_rating !== undefined) payload.equipment_rating = command.equipment_rating;
    if (command.staff_rating !== undefined) payload.staff_rating = command.staff_rating;
    if (command.value_rating !== undefined) payload.value_rating = command.value_rating;
    if (command.reported !== undefined) payload.reported = command.reported;

    const updated = await gymReviewRepository.updateReview(
      command.reviewId,
      payload,
      { transaction }
    );

    // Recalcular estadísticas si cambió el rating
    let updatedStats = null;
    if (command.rating !== undefined) {
      await recalculateStats(review.id_gym, transaction);
      updatedStats = await gymReviewRepository.findRatingStatsByGymId(review.id_gym, { transaction });
    }

    await transaction.commit();

    // Emitir evento WebSocket de review actualizada
    emitEvent(EVENTS.REVIEW_UPDATED, {
      reviewId: command.reviewId,
      gymId: review.id_gym,
      userId: review.id_user_profile,
      rating: updated.rating,
      title: updated.title,
      comment: updated.comment,
    });

    // Emitir evento de actualización de rating del gym si cambió el rating
    if (updatedStats) {
      emitEvent(EVENTS.GYM_RATING_UPDATED, {
        gymId: review.id_gym,
        averageRating: parseFloat(updatedStats.avg_rating),
        totalReviews: updatedStats.total_reviews,
      });
    }

    return updated;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Elimina una reseña
 * @param {DeleteGymReviewCommand} command
 * @returns {Promise<boolean>} true si se eliminó
 */
async function deleteGymReview(command) {
  const transaction = await sequelize.transaction();
  try {
    const review = await gymReviewRepository.findReviewById(command.reviewId, { transaction });
    if (!review) {
      throw new NotFoundError('Reseña no encontrada');
    }

    // Verificar permisos
    if (!command.isAdmin && review.id_user_profile !== command.userId) {
      throw new BusinessError('No puedes eliminar reseñas de otros usuarios', 'REVIEW_FORBIDDEN');
    }

    const gymId = review.id_gym;

    await gymReviewRepository.deleteReview(command.reviewId, { transaction });

    // Recalcular estadísticas
    await recalculateStats(gymId, transaction);

    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ============================================================================
// REVIEW HELPFUL VOTES
// ============================================================================

/**
 * Marca una reseña como útil
 * @param {MarkReviewHelpfulCommand} command
 * @returns {Promise<Object>} Reseña actualizada
 */
async function markReviewHelpful(command) {
  const transaction = await sequelize.transaction();
  try {
    const review = await gymReviewRepository.findReviewById(command.reviewId, { transaction });
    if (!review) {
      throw new NotFoundError('Reseña no encontrada');
    }

    // No se puede marcar la propia reseña
    if (review.id_user_profile === command.userId) {
      throw new BusinessError('No puedes marcar tu propia reseña como útil', 'REVIEW_SELF_HELPFUL');
    }

    // Verificar si ya votó
    const existingVote = await gymReviewRepository.findHelpfulVote(
      command.reviewId,
      command.userId,
      { transaction }
    );

    if (existingVote) {
      // Ya votó, actualizar si cambió el voto
      if (existingVote.is_helpful !== command.isHelpful) {
        await gymReviewRepository.updateHelpfulVote(
          command.reviewId,
          command.userId,
          command.isHelpful,
          { transaction }
        );
      } else {
        throw new ConflictError('Ya marcaste esta reseña');
      }
    } else {
      // Crear nuevo voto
      await gymReviewRepository.createHelpfulVote(
        {
          id_review: command.reviewId,
          id_user_profile: command.userId,
          is_helpful: command.isHelpful,
        },
        { transaction }
      );
    }

    // El helpful_count se maneja en el trigger de la BD o podría calcularse aquí
    // Por ahora devolvemos la reseña actualizada
    const updated = await gymReviewRepository.findReviewById(command.reviewId, { transaction });

    await transaction.commit();
    return updated;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Remueve el voto de utilidad de una reseña
 * @param {UnmarkReviewHelpfulCommand} command
 * @returns {Promise<boolean>} true si se eliminó
 */
async function unmarkReviewHelpful(command) {
  const transaction = await sequelize.transaction();
  try {
    const review = await gymReviewRepository.findReviewById(command.reviewId, { transaction });
    if (!review) {
      throw new NotFoundError('Reseña no encontrada');
    }

    const deleted = await gymReviewRepository.deleteHelpfulVote(
      command.reviewId,
      command.userId,
      { transaction }
    );

    await transaction.commit();
    return deleted > 0;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ============================================================================
// RATING STATS
// ============================================================================

/**
 * Obtiene las estadísticas de rating de un gimnasio
 * @param {GetGymRatingStatsQuery} query
 * @returns {Promise<Object>} Estadísticas de rating
 */
async function getGymRatingStats(query) {
  // Verificar que el gimnasio existe
  const gym = await gymRepository.findById(query.gymId);
  if (!gym) {
    throw new NotFoundError('Gimnasio no encontrado');
  }

  const stats = await gymReviewRepository.findRatingStatsByGymId(query.gymId);

  if (!stats) {
    // Devolver stats vacías si no existen
    return {
      id_gym: query.gymId,
      avg_rating: 0,
      total_reviews: 0,
      rating_5_count: 0,
      rating_4_count: 0,
      rating_3_count: 0,
      rating_2_count: 0,
      rating_1_count: 0,
      avg_cleanliness: 0,
      avg_equipment: 0,
      avg_staff: 0,
      avg_value: 0,
      last_review_date: null,
      updated_at: null,
    };
  }

  return stats;
}

module.exports = {
  // Reviews
  listGymReviews,
  getGymReview,
  getUserReviews,
  createGymReview,
  updateGymReview,
  deleteGymReview,

  // Helpful votes
  markReviewHelpful,
  unmarkReviewHelpful,

  // Stats
  getGymRatingStats,
  recalculateStats,
};
