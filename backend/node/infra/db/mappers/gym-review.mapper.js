/**
 * Mappers de infra para GymReview, ReviewHelpful, GymRatingStats
 * Transforman modelos Sequelize a POJOs
 */

function toGymReview(model) {
  if (!model) return null;
  const review = {
    id_review: model.id_review,
    id_gym: model.id_gym,
    id_user_profile: model.id_user_profile,
    rating: parseFloat(model.rating),
    title: model.title,
    comment: model.comment,
    cleanliness_rating: model.cleanliness_rating,
    equipment_rating: model.equipment_rating,
    staff_rating: model.staff_rating,
    facilities_rating: model.facilities_rating,
    value_rating: model.value_rating,
    helpful_count: model.helpful_count || 0,
    not_helpful_count: model.not_helpful_count || 0,
    created_at: model.created_at,
    updated_at: model.updated_at,
  };

  // Incluir asociaciones si están presentes
  if (model.author) {
    review.userProfile = {
      id_user_profile: model.author.id_user_profile,
      name: model.author.name,
      profile_picture_url: model.author.profile_picture_url,
    };
  }

  if (model.gym) {
    review.gym = {
      id_gym: model.gym.id_gym,
      name: model.gym.name,
      city: model.gym.city,
    };
  }

  return review;
}

function toGymReviews(models) {
  if (!models || !Array.isArray(models)) return [];
  return models.map(toGymReview).filter(Boolean);
}

function toGymRatingStats(model) {
  if (!model) return null;
  return {
    id_gym: model.id_gym,
    total_reviews: model.total_reviews || 0,
    average_rating: model.average_rating ? parseFloat(model.average_rating) : 0,
    rating_1_count: model.rating_1_count || 0,
    rating_2_count: model.rating_2_count || 0,
    rating_3_count: model.rating_3_count || 0,
    rating_4_count: model.rating_4_count || 0,
    rating_5_count: model.rating_5_count || 0,
    avg_cleanliness: model.avg_cleanliness ? parseFloat(model.avg_cleanliness) : null,
    avg_equipment: model.avg_equipment ? parseFloat(model.avg_equipment) : null,
    avg_staff: model.avg_staff ? parseFloat(model.avg_staff) : null,
    avg_facilities: model.avg_facilities ? parseFloat(model.avg_facilities) : null,
    avg_value: model.avg_value ? parseFloat(model.avg_value) : null,
    last_updated: model.last_updated,
  };
}

module.exports = {
  toGymReview,
  toGymReviews,
  toGymRatingStats,
};
