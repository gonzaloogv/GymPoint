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
 * GET /api/gyms/:gymId/reviews
 * Lista las reseñas de un gimnasio
 */
const listGymReviews = async (req, res) => {
  try {
    const gymId = parseInt(req.params.gymId, 10);
    const { page, limit, min_rating, max_rating, with_comment_only, sortBy, order } = req.query;

    const query = gymReviewMappers.toListGymReviewsQuery({
      gymId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      min_rating: min_rating ? parseFloat(min_rating) : undefined,
      max_rating: max_rating ? parseFloat(max_rating) : undefined,
      with_comment_only: with_comment_only === 'true',
      sortBy,
      order,
    });

    const result = await reviewService.listGymReviews(query);
    const dto = gymReviewMappers.toPaginatedGymReviewsDTO(result);

    res.json(dto);
  } catch (error) {
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
    const reviewId = parseInt(req.params.reviewId, 10);

    const query = gymReviewMappers.toGetGymReviewQuery(reviewId);
    const review = await reviewService.getGymReview(query);

    if (!review) {
      return res.status(404).json({
        error: {
          code: 'REVIEW_NOT_FOUND',
          message: 'Reseña no encontrada',
        },
      });
    }

    const dto = gymReviewMappers.toGymReviewDTO(review);
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
    const userId = parseInt(req.params.userId, 10);
    const { page, limit, sortBy, order } = req.query;

    const query = gymReviewMappers.toGetUserReviewsQuery({
      userId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy,
      order,
    });

    const result = await reviewService.getUserReviews(query);
    const dto = gymReviewMappers.toPaginatedGymReviewsDTO(result);

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
    const gymId = parseInt(req.params.gymId, 10);
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
      gymId,
      userProfile.id_user_profile
    );

    const review = await reviewService.createGymReview(command);
    const dto = gymReviewMappers.toGymReviewDTO(review);

    res.status(201).json(dto);
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
    const reviewId = parseInt(req.params.reviewId, 10);
    const userProfile = req.account?.userProfile;
    const isAdmin = req.roles?.includes('ADMIN');

    const command = gymReviewMappers.toUpdateGymReviewCommand(
      req.body,
      reviewId,
      userProfile?.id_user_profile,
      isAdmin
    );

    const review = await reviewService.updateGymReview(command);
    const dto = gymReviewMappers.toGymReviewDTO(review);

    res.json(dto);
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
    const reviewId = parseInt(req.params.reviewId, 10);
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
 * POST /api/reviews/:reviewId/helpful
 * Marca una reseña como útil
 */
const markReviewHelpful = async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId, 10);
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
    const dto = gymReviewMappers.toGymReviewDTO(review);

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
 * DELETE /api/reviews/:reviewId/helpful
 * Remueve el voto de utilidad de una reseña
 */
const unmarkReviewHelpful = async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId, 10);
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

    const removed = await reviewService.unmarkReviewHelpful(command);

    res.json({ removed });
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
    const gymId = parseInt(req.params.gymId, 10);

    const query = gymReviewMappers.toGetGymRatingStatsQuery(gymId);
    const stats = await reviewService.getGymRatingStats(query);
    const dto = gymReviewMappers.toGymRatingStatsDTO(stats);

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
