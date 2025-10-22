const { Op } = require('sequelize');
const sequelize = require('../../../config/database');
const {
  GymReview,
  ReviewHelpful,
  GymRatingStats,
  UserProfile,
  Gym,
} = require('../../../models');
const { toGymReview, toGymReviews, toGymRatingStats } = require('../mappers/gym-review.mapper');

const USER_PROFILE_ASSOC = {
  model: UserProfile,
  as: 'userProfile',
  attributes: ['id_user_profile', 'name', 'profile_picture_url'],
};

const GYM_ASSOC = {
  model: Gym,
  as: 'gym',
  attributes: ['id_gym', 'name', 'city'],
};

// ============================================================================
// GYM REVIEW
// ============================================================================

async function findReviewsByGymId({ gymId, filters = {}, pagination = {}, sort = {}, options = {} }) {
  const where = { id_gym: gymId };

  if (filters.min_rating) {
    where.rating = where.rating || {};
    where.rating[Op.gte] = filters.min_rating;
  }

  if (filters.max_rating) {
    where.rating = where.rating || {};
    where.rating[Op.lte] = filters.max_rating;
  }

  if (filters.with_comment_only) {
    where.comment = { [Op.ne]: null };
  }

  const { page = 1, limit = 20 } = pagination;
  const offset = (page - 1) * limit;

  const { sortBy = 'created_at', order = 'DESC' } = sort;
  const validSortFields = ['created_at', 'rating', 'helpful_count', 'updated_at'];
  const orderField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
  const orderDir = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

  const { rows, count } = await GymReview.findAndCountAll({
    where,
    include: [USER_PROFILE_ASSOC],
    limit,
    offset,
    order: [[orderField, orderDir]],
    transaction: options.transaction,
  });

  return {
    items: toGymReviews(rows),
    total: count,
    page,
    limit,
  };
}

async function findReviewById(reviewId, options = {}) {
  const review = await GymReview.findByPk(reviewId, {
    include: [USER_PROFILE_ASSOC, GYM_ASSOC],
    transaction: options.transaction,
  });
  return toGymReview(review);
}

async function findReviewByUserAndGym(userId, gymId, options = {}) {
  const review = await GymReview.findOne({
    where: { id_user_profile: userId, id_gym: gymId },
    transaction: options.transaction,
  });
  return toGymReview(review);
}

async function findReviewsByUserId({ userId, pagination = {}, sort = {}, options = {} }) {
  const { page = 1, limit = 20 } = pagination;
  const offset = (page - 1) * limit;

  const { sortBy = 'created_at', order = 'DESC' } = sort;
  const orderField = ['created_at', 'rating', 'updated_at'].includes(sortBy)
    ? sortBy
    : 'created_at';
  const orderDir = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

  const { rows, count } = await GymReview.findAndCountAll({
    where: { id_user_profile: userId },
    include: [GYM_ASSOC],
    limit,
    offset,
    order: [[orderField, orderDir]],
    transaction: options.transaction,
  });

  return {
    items: toGymReviews(rows),
    total: count,
    page,
    limit,
  };
}

async function createReview(payload, options = {}) {
  const review = await GymReview.create(payload, {
    transaction: options.transaction,
  });
  return toGymReview(review);
}

async function updateReview(reviewId, payload, options = {}) {
  await GymReview.update(payload, {
    where: { id_review: reviewId },
    transaction: options.transaction,
  });
  return findReviewById(reviewId, options);
}

async function deleteReview(reviewId, options = {}) {
  return GymReview.destroy({
    where: { id_review: reviewId },
    transaction: options.transaction,
  });
}

// ============================================================================
// REVIEW HELPFUL (Votos de utilidad)
// ============================================================================

async function findHelpfulVote(reviewId, userId, options = {}) {
  return ReviewHelpful.findOne({
    where: { id_review: reviewId, id_user_profile: userId },
    transaction: options.transaction,
  });
}

async function createHelpfulVote(payload, options = {}) {
  return ReviewHelpful.create(payload, {
    transaction: options.transaction,
  });
}

async function updateHelpfulVote(reviewId, userId, isHelpful, options = {}) {
  return ReviewHelpful.update(
    { is_helpful: isHelpful },
    {
      where: { id_review: reviewId, id_user_profile: userId },
      transaction: options.transaction,
    }
  );
}

async function deleteHelpfulVote(reviewId, userId, options = {}) {
  return ReviewHelpful.destroy({
    where: { id_review: reviewId, id_user_profile: userId },
    transaction: options.transaction,
  });
}

// ============================================================================
// GYM RATING STATS
// ============================================================================

async function findRatingStatsByGymId(gymId, options = {}) {
  const stats = await GymRatingStats.findOne({
    where: { id_gym: gymId },
    transaction: options.transaction,
  });
  return toGymRatingStats(stats);
}

async function upsertRatingStats(payload, options = {}) {
  const [stats, created] = await GymRatingStats.upsert(payload, {
    transaction: options.transaction,
    returning: true,
  });
  return toGymRatingStats(stats);
}

module.exports = {
  // Reviews
  findReviewsByGymId,
  findReviewById,
  findReviewByUserAndGym,
  findReviewsByUserId,
  createReview,
  updateReview,
  deleteReview,

  // Helpful votes
  findHelpfulVote,
  createHelpfulVote,
  updateHelpfulVote,
  deleteHelpfulVote,

  // Rating stats
  findRatingStatsByGymId,
  upsertRatingStats,
};
