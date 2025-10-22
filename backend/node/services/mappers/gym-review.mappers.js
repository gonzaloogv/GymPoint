/**
 * Mappers para el dominio Gym Reviews (Reseñas)
 *
 * Transforman entre DTOs (API) ↔ Commands/Queries ↔ Entidades (dominio)
 */

const {
  CreateGymReviewCommand,
  UpdateGymReviewCommand,
  DeleteGymReviewCommand,
  MarkReviewHelpfulCommand,
  RemoveReviewHelpfulCommand,
  ReportReviewCommand,
} = require('../commands/gym-review.commands');

const {
  ListGymReviewsQuery,
  GetGymReviewByIdQuery,
  GetGymRatingStatsQuery,
  ListUserReviewsQuery,
  HasUserReviewedGymQuery,
  ListReportedReviewsQuery,
  GetGymRatingDistributionQuery,
} = require('../queries/gym-review.queries');

const { normalizePagination } = require('../../utils/pagination');
const { normalizeSortParams } = require('../../utils/sort-whitelist');

const REVIEW_SORTABLE_FIELDS = new Set(['created_at', 'rating', 'helpful_count', 'updated_at']);

// ============================================================================
// RequestDTO → Command
// ============================================================================

function toCreateGymReviewCommand(dto, userId, gymId) {
  return new CreateGymReviewCommand({
    userId,
    gymId,
    rating: dto.rating,
    title: dto.title || null,
    comment: dto.comment || null,
    cleanliness_rating: dto.cleanliness_rating || null,
    equipment_rating: dto.equipment_rating || null,
    staff_rating: dto.staff_rating || null,
    facilities_rating: dto.facilities_rating || null,
    value_rating: dto.value_rating || null,
  });
}

function toUpdateGymReviewCommand(dto, reviewId, userId) {
  return new UpdateGymReviewCommand({
    reviewId,
    userId,
    rating: dto.rating,
    title: dto.title,
    comment: dto.comment,
    cleanliness_rating: dto.cleanliness_rating,
    equipment_rating: dto.equipment_rating,
    staff_rating: dto.staff_rating,
    facilities_rating: dto.facilities_rating,
    value_rating: dto.value_rating,
  });
}

function toDeleteGymReviewCommand(reviewId, userId, isAdmin = false, deleteReason = null) {
  return new DeleteGymReviewCommand({ reviewId, userId, isAdmin, deleteReason });
}

function toMarkReviewHelpfulCommand(reviewId, userId, isHelpful) {
  return new MarkReviewHelpfulCommand({ reviewId, userId, isHelpful });
}

function toRemoveReviewHelpfulCommand(reviewId, userId) {
  return new RemoveReviewHelpfulCommand({ reviewId, userId });
}

function toReportReviewCommand(dto, reviewId, userId) {
  return new ReportReviewCommand({
    reviewId,
    userId,
    reason: dto.reason,
    details: dto.details || null,
  });
}

// ============================================================================
// RequestDTO → Query
// ============================================================================

function toListGymReviewsQuery(gymId, queryParams, userId = null) {
  const { page, limit } = normalizePagination({
    page: queryParams.page,
    limit: queryParams.limit,
  });

  const { sortBy, order } = normalizeSortParams(
    queryParams.sortBy,
    queryParams.order,
    REVIEW_SORTABLE_FIELDS,
    'created_at',
    'DESC'
  );

  return new ListGymReviewsQuery({
    gymId,
    page,
    limit,
    sortBy,
    order,
    min_rating: queryParams.min_rating ? parseFloat(queryParams.min_rating) : null,
    max_rating: queryParams.max_rating ? parseFloat(queryParams.max_rating) : null,
    with_comment_only: queryParams.with_comment_only === 'true',
    userId,
  });
}

function toGetGymReviewByIdQuery(reviewId, userId = null) {
  return new GetGymReviewByIdQuery({ reviewId, userId });
}

function toGetGymRatingStatsQuery(gymId) {
  return new GetGymRatingStatsQuery({ gymId });
}

function toListUserReviewsQuery(userId, queryParams) {
  const { page, limit } = normalizePagination({
    page: queryParams.page,
    limit: queryParams.limit,
  });

  const { sortBy, order } = normalizeSortParams(
    queryParams.sortBy,
    queryParams.order,
    REVIEW_SORTABLE_FIELDS,
    'created_at',
    'DESC'
  );

  return new ListUserReviewsQuery({
    userId,
    page,
    limit,
    sortBy,
    order,
  });
}

function toHasUserReviewedGymQuery(userId, gymId) {
  return new HasUserReviewedGymQuery({ userId, gymId });
}

function toListReportedReviewsQuery(queryParams) {
  const { page, limit } = normalizePagination({
    page: queryParams.page,
    limit: queryParams.limit,
  });

  return new ListReportedReviewsQuery({
    page,
    limit,
    status: queryParams.status || 'pending',
  });
}

function toGetGymRatingDistributionQuery(gymId) {
  return new GetGymRatingDistributionQuery({ gymId });
}

// ============================================================================
// Entity → ResponseDTO
// ============================================================================

function toGymReviewResponse(review, options = {}) {
  const response = {
    id_review: review.id_review,
    id_gym: review.id_gym,
    id_user_profile: review.id_user_profile,
    rating: parseFloat(review.rating),
    title: review.title || null,
    comment: review.comment || null,
    cleanliness_rating: review.cleanliness_rating || null,
    equipment_rating: review.equipment_rating || null,
    staff_rating: review.staff_rating || null,
    facilities_rating: review.facilities_rating || null,
    value_rating: review.value_rating || null,
    helpful_count: review.helpful_count || 0,
    not_helpful_count: review.not_helpful_count || 0,
    created_at: review.created_at.toISOString(),
    updated_at: review.updated_at.toISOString(),
  };

  // Agregar info del usuario autor si está disponible
  if (review.userProfile) {
    response.user = {
      id_user_profile: review.userProfile.id_user_profile,
      name: review.userProfile.name,
      profile_picture_url: review.userProfile.profile_picture_url || null,
    };
  }

  // Agregar si el usuario actual votó útil
  if (options.user_voted !== undefined) {
    response.user_voted = options.user_voted;
  }

  return response;
}

function toPaginatedGymReviewsResponse({ items, total, page, limit }, options = {}) {
  return {
    items: items.map(review => toGymReviewResponse(review, options)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

function toGymRatingStatsResponse(stats) {
  return {
    id_gym: stats.id_gym,
    total_reviews: stats.total_reviews || 0,
    average_rating: parseFloat(stats.average_rating) || 0,
    rating_1_count: stats.rating_1_count || 0,
    rating_2_count: stats.rating_2_count || 0,
    rating_3_count: stats.rating_3_count || 0,
    rating_4_count: stats.rating_4_count || 0,
    rating_5_count: stats.rating_5_count || 0,
    avg_cleanliness: stats.avg_cleanliness ? parseFloat(stats.avg_cleanliness) : null,
    avg_equipment: stats.avg_equipment ? parseFloat(stats.avg_equipment) : null,
    avg_staff: stats.avg_staff ? parseFloat(stats.avg_staff) : null,
    avg_facilities: stats.avg_facilities ? parseFloat(stats.avg_facilities) : null,
    avg_value: stats.avg_value ? parseFloat(stats.avg_value) : null,
    last_updated: stats.last_updated ? stats.last_updated.toISOString() : null,
  };
}

module.exports = {
  // RequestDTO → Command
  toCreateGymReviewCommand,
  toUpdateGymReviewCommand,
  toDeleteGymReviewCommand,
  toMarkReviewHelpfulCommand,
  toRemoveReviewHelpfulCommand,
  toReportReviewCommand,

  // RequestDTO → Query
  toListGymReviewsQuery,
  toGetGymReviewByIdQuery,
  toGetGymRatingStatsQuery,
  toListUserReviewsQuery,
  toHasUserReviewedGymQuery,
  toListReportedReviewsQuery,
  toGetGymRatingDistributionQuery,

  // Entity → ResponseDTO
  toGymReviewResponse,
  toPaginatedGymReviewsResponse,
  toGymRatingStatsResponse,
};
