/**
 * Gym Review Controller - Lote 4
 * Maneja endpoints de reseñas de gimnasios
 */

const reviewService = require('../services/review-service');
const {
  gymReviewMappers,
} = require('../services/mappers');

// ============================================================================
// GYM REVIEWS
// ============================================================================

/**
 * GET /api/gym-reviews
 * Lista todas las reseñas de todos los gimnasios (admin)
 */
const listAllGymReviews = async (req, res) => {
  try {
    const { page, limit, min_rating, max_rating, with_comment_only, sortBy, order, gym_id } = req.query;

    const query = gymReviewMappers.toListGymReviewsQuery(
      gym_id ? Number.parseInt(gym_id, 10) : undefined,
      {
        page: page ? Number.parseInt(page, 10) : undefined,
        limit: limit ? Number.parseInt(limit, 10) : undefined,
        min_rating: min_rating ? Number.parseFloat(min_rating) : undefined,
        max_rating: max_rating ? Number.parseFloat(max_rating) : undefined,
        with_comment_only: with_comment_only === 'true',
        sortBy,
        order,
      },
      req.account?.userProfile?.id_user_profile
    );

    const result = await reviewService.listGymReviews(query);
    const dto = gymReviewMappers.toPaginatedGymReviewsResponse(result);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'LIST_ALL_REVIEWS_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * GET /api/gyms/:gymId/reviews
 * Lista las reseñas de un gimnasio
 */
const listGymReviews = async (req, res) => {
  try {
    const gymId = Number.parseInt(req.params.gymId, 10);
    const { page, limit, min_rating, max_rating, with_comment_only, sortBy, order } = req.query;
    const currentUserId = req.account?.userProfile?.id_user_profile;

    const query = gymReviewMappers.toListGymReviewsQuery(
      gymId,
      {
        page: page ? Number.parseInt(page, 10) : undefined,
        limit: limit ? Number.parseInt(limit, 10) : undefined,
        min_rating: min_rating ? Number.parseFloat(min_rating) : undefined,
        max_rating: max_rating ? Number.parseFloat(max_rating) : undefined,
        with_comment_only: with_comment_only === 'true',
        sortBy,
        order,
      },
      currentUserId
    );

    const result = await reviewService.listGymReviews(query);

    // Si hay usuario logueado, consultar sus votos
    let userVotesMap = {};
    if (currentUserId && result.items && result.items.length > 0) {
      const { ReviewHelpful } = require('../models');
      const reviewIds = result.items.map(r => r.id_review);

      const userVotes = await ReviewHelpful.findAll({
        where: {
          id_review: reviewIds,
          id_user_profile: currentUserId
        }
      });

      // Crear mapa de votos: reviewId -> true
      userVotesMap = userVotes.reduce((map, vote) => {
        map[vote.id_review] = true;
        return map;
      }, {});

    }

    // Enriquecer cada review con hasUserVoted
    const enrichedItems = result.items.map(review => ({
      ...review,
      hasUserVoted: !!userVotesMap[review.id_review]
    }));

    const dto = gymReviewMappers.toPaginatedGymReviewsResponse({
      ...result,
      items: enrichedItems
    });

    res.json(dto);
  } catch (error) {
    console.error('[listGymReviews] Error:', error);
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'LIST_REVIEWS_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * GET /api/reviews/:reviewId
 * Obtiene una reseña específica
 */
const getGymReview = async (req, res) => {
  try {
    const reviewId = Number.parseInt(req.params.reviewId, 10);

    const query = gymReviewMappers.toGetGymReviewByIdQuery(
      reviewId,
      req.account?.userProfile?.id_user_profile
    );
    const review = await reviewService.getGymReview(query);

    if (!review) {
      return res.status(404).json({
        error: {
          code: 'REVIEW_NOT_FOUND',
          message: 'Reseña no encontrada',
        },
      });
    }

    const dto = gymReviewMappers.toGymReviewResponse(review);
    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_REVIEW_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * GET /api/users/:userId/reviews
 * Lista las reseñas de un usuario
 */
const getUserReviews = async (req, res) => {
  try {
    const userId = Number.parseInt(req.params.userId, 10);
    const { page, limit, sortBy, order } = req.query;

    const query = gymReviewMappers.toListUserReviewsQuery(
      userId,
      {
        page: page ? Number.parseInt(page, 10) : undefined,
        limit: limit ? Number.parseInt(limit, 10) : undefined,
        sortBy,
        order,
      }
    );

    const result = await reviewService.getUserReviews(query);
    const dto = gymReviewMappers.toPaginatedGymReviewsResponse(result);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_USER_REVIEWS_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * POST /api/gyms/:gymId/reviews
 * Crea una nueva reseña
 */
const createGymReview = async (req, res) => {
  try {
    const gymId = Number.parseInt(req.params.gymId, 10);
    const userProfile = req.account?.userProfile;

    if (!userProfile) {
      return res.status(403).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Perfil de usuario requerido',
        },
      });
    }

    const command = gymReviewMappers.toCreateGymReviewCommand(
      req.body,
      userProfile.id_user_profile,
      gymId
    );

    const review = await reviewService.createGymReview(command);
    const dto = gymReviewMappers.toGymReviewResponse(review);

    res.status(201).json({
      message: 'Review creada exitosamente',
      data: dto,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'CREATE_REVIEW_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * PATCH /api/reviews/:reviewId
 * Actualiza una reseña
 */
const updateGymReview = async (req, res) => {
  try {
    const reviewId = Number.parseInt(req.params.reviewId, 10);
    const userProfile = req.account?.userProfile;
    const isAdmin = req.roles?.includes('ADMIN');

    const command = gymReviewMappers.toUpdateGymReviewCommand(
      req.body,
      reviewId,
      userProfile?.id_user_profile,
      isAdmin
    );

    const review = await reviewService.updateGymReview(command);
    const dto = gymReviewMappers.toGymReviewResponse(review);

    res.json({
      message: 'Review actualizada exitosamente',
      data: dto,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'UPDATE_REVIEW_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * DELETE /api/reviews/:reviewId
 * Elimina una reseña
 */
const deleteGymReview = async (req, res) => {
  try {
    const reviewId = Number.parseInt(req.params.reviewId, 10);
    const userProfile = req.account?.userProfile;
    const isAdmin = req.roles?.includes('ADMIN');

    const command = gymReviewMappers.toDeleteGymReviewCommand(
      reviewId,
      userProfile?.id_user_profile,
      isAdmin
    );

    await reviewService.deleteGymReview(command);

    res.status(204).send();
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'DELETE_REVIEW_FAILED',
        message: error.message,
      },
    });
  }
};

// ============================================================================
// REVIEW HELPFUL VOTES
// ============================================================================

/**
 * POST /api/reviews/:id_review/helpful
 * Marca una reseña como útil
 */
const markReviewHelpful = async (req, res) => {
  try {
    const reviewId = Number.parseInt(req.params.id_review, 10);
    const userProfile = req.account?.userProfile;

    if (!userProfile) {
      return res.status(403).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Perfil de usuario requerido',
        },
      });
    }

    const command = gymReviewMappers.toMarkReviewHelpfulCommand(
      reviewId,
      userProfile.id_user_profile,
      true // isHelpful
    );

    const review = await reviewService.markReviewHelpful(command);

    // Agregar hasUserVoted: true porque acabamos de votar
    const enrichedReview = {
      ...review,
      hasUserVoted: true
    };

    const dto = gymReviewMappers.toGymReviewResponse(enrichedReview);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'MARK_HELPFUL_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * DELETE /api/reviews/:id_review/helpful
 * Remueve el voto de utilidad de una reseña
 */
const unmarkReviewHelpful = async (req, res) => {
  try {
    const reviewId = Number.parseInt(req.params.id_review, 10);
    const userProfile = req.account?.userProfile;

    if (!userProfile) {
      return res.status(403).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Perfil de usuario requerido',
        },
      });
    }

    const command = gymReviewMappers.toUnmarkReviewHelpfulCommand(
      reviewId,
      userProfile.id_user_profile
    );

    const review = await reviewService.unmarkReviewHelpful(command);

    // Agregar hasUserVoted: false porque acabamos de quitar el voto
    const enrichedReview = {
      ...review,
      hasUserVoted: false
    };

    const dto = gymReviewMappers.toGymReviewResponse(enrichedReview);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'UNMARK_HELPFUL_FAILED',
        message: error.message,
      },
    });
  }
};

// ============================================================================
// RATING STATS
// ============================================================================

/**
 * GET /api/gyms/:gymId/reviews/stats
 * Obtiene las estadísticas de rating de un gimnasio
 */
const getGymRatingStats = async (req, res) => {
  try {
    const gymId = Number.parseInt(req.params.gymId, 10);

    const query = gymReviewMappers.toGetGymRatingStatsQuery(gymId);
    const stats = await reviewService.getGymRatingStats(query);
    const dto = gymReviewMappers.toGymRatingStatsResponse(stats);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_STATS_FAILED',
        message: error.message,
      },
    });
  }
};

module.exports = {
  // Reviews
  listAllGymReviews,
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

  // Legacy compatibility (old function names)
  listarPorGym: listGymReviews,
  obtenerStats: getGymRatingStats,
  crearReview: createGymReview,
  actualizarReview: updateGymReview,
  eliminarReview: deleteGymReview,
  marcarUtil: markReviewHelpful,
  removerUtil: unmarkReviewHelpful,
};
