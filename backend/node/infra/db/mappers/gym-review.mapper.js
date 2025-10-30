/**
 * Mappers de infra para GymReview, ReviewHelpful, GymRatingStats
 * Transforman modelos Sequelize a POJOs
 */

function toGymReview(model) {
  if (!model) return null;

  // Convertir modelo Sequelize a objeto plano
  const plainModel = model.toJSON ? model.toJSON() : model;

  const review = {
    id_review: plainModel.id_review,
    id_gym: plainModel.id_gym,
    id_user_profile: plainModel.id_user_profile,
    rating: parseFloat(plainModel.rating),
    title: plainModel.title,
    comment: plainModel.comment,
    cleanliness_rating: plainModel.cleanliness_rating,
    equipment_rating: plainModel.equipment_rating,
    staff_rating: plainModel.staff_rating,
    facilities_rating: plainModel.facilities_rating,
    value_rating: plainModel.value_rating,
    helpful_count: plainModel.helpful_count || 0,
    not_helpful_count: plainModel.not_helpful_count || 0,
    is_verified: plainModel.is_verified || false,
    reported: plainModel.reported || false,
    created_at: plainModel.created_at,
    updated_at: plainModel.updated_at,
  };

  // Incluir asociaciones si están presentes
  if (plainModel.author) {
    review.user = {
      id_user_profile: plainModel.author.id_user_profile,
      name: plainModel.author.name,
      profile_picture_url: plainModel.author.profile_picture_url,
    };
  }

  if (plainModel.gym) {
    review.gym = {
      id_gym: plainModel.gym.id_gym,
      name: plainModel.gym.name,
      city: plainModel.gym.city,
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
