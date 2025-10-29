/**
 * Review Mappers
 * Transformaciones entre DTOs del backend y entidades de dominio
 */

import {
  Review,
  ReviewAuthor,
  ReviewGym,
  RatingStats,
  PaginatedReviews,
  CreateReviewData,
  UpdateReviewData,
} from '../../domain/entities/Review';
import {
  ReviewDTO,
  RatingStatsDTO,
  PaginatedReviewsResponseDTO,
  CreateReviewRequestDTO,
  UpdateReviewRequestDTO,
} from '../dto/review.api.dto';

/**
 * Mapea ReviewDTO del backend a Review entity del dominio
 */
export function mapReviewDTOToEntity(dto: ReviewDTO): Review {
  const author: ReviewAuthor | undefined = dto.user
    ? {
        id: dto.user.id_user_profile,
        name: dto.user.name,
        lastname: dto.user.lastname,
        profilePictureUrl: dto.user.profile_picture_url,
      }
    : undefined;

  const gym: ReviewGym | undefined = dto.gym
    ? {
        id: dto.gym.id_gym,
        name: dto.gym.name,
        city: dto.gym.city,
      }
    : undefined;

  return {
    id: dto.id_review,
    gymId: dto.id_gym,
    userId: dto.id_user_profile,
    rating: dto.rating,
    title: dto.title,
    comment: dto.comment,
    cleanlinessRating: dto.cleanliness_rating,
    equipmentRating: dto.equipment_rating,
    staffRating: dto.staff_rating,
    valueRating: dto.value_rating,
    helpfulCount: dto.helpful_count,
    isVerified: dto.is_verified,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    author,
    gym,
  };
}

/**
 * Mapea array de ReviewDTO a array de Review entities
 */
export function mapReviewDTOsToEntities(dtos: ReviewDTO[]): Review[] {
  return dtos.map(mapReviewDTOToEntity);
}

/**
 * Mapea RatingStatsDTO del backend a RatingStats entity
 */
export function mapRatingStatsDTOToEntity(dto: RatingStatsDTO): RatingStats {
  return {
    gymId: dto.id_gym,
    averageRating: dto.avg_rating,
    totalReviews: dto.total_reviews,
    rating5Count: dto.rating_5_count,
    rating4Count: dto.rating_4_count,
    rating3Count: dto.rating_3_count,
    rating2Count: dto.rating_2_count,
    rating1Count: dto.rating_1_count,
    averageCleanliness: dto.avg_cleanliness,
    averageEquipment: dto.avg_equipment,
    averageStaff: dto.avg_staff,
    averageValue: dto.avg_value,
    lastReviewDate: dto.last_review_date ? new Date(dto.last_review_date) : null,
    updatedAt: new Date(dto.updated_at),
  };
}

/**
 * Mapea respuesta paginada del backend a PaginatedReviews entity
 */
export function mapPaginatedReviewsResponseToEntity(
  response: PaginatedReviewsResponseDTO
): PaginatedReviews {
  return {
    items: mapReviewDTOsToEntities(response.data),
    page: response.pagination.page,
    limit: response.pagination.limit,
    total: response.pagination.total,
    totalPages: response.pagination.totalPages,
  };
}

/**
 * Mapea CreateReviewData del dominio a CreateReviewRequestDTO para el backend
 */
export function mapCreateReviewDataToRequestDTO(
  data: CreateReviewData
): CreateReviewRequestDTO {
  return {
    id_gym: data.gymId,
    rating: data.rating,
    title: data.title,
    comment: data.comment,
    cleanliness_rating: data.cleanlinessRating,
    equipment_rating: data.equipmentRating,
    staff_rating: data.staffRating,
    value_rating: data.valueRating,
  };
}

/**
 * Mapea UpdateReviewData del dominio a UpdateReviewRequestDTO para el backend
 */
export function mapUpdateReviewDataToRequestDTO(
  data: UpdateReviewData
): UpdateReviewRequestDTO {
  return {
    rating: data.rating,
    title: data.title,
    comment: data.comment,
    cleanliness_rating: data.cleanlinessRating,
    equipment_rating: data.equipmentRating,
    staff_rating: data.staffRating,
    value_rating: data.valueRating,
  };
}
