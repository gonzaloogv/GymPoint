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
    title: dto.title || '',
    comment: dto.comment || '',
    cleanlinessRating: dto.cleanliness_rating || null,
    equipmentRating: dto.equipment_rating || null,
    staffRating: dto.staff_rating || null,
    valueRating: dto.value_rating || null,
    helpfulCount: dto.helpful_count || 0,
    isVerified: dto.is_verified || false,
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
    averageRating: dto.average_rating || dto.avg_rating || 0,
    totalReviews: dto.total_reviews || 0,
    rating5Count: dto.rating_5_count || 0,
    rating4Count: dto.rating_4_count || 0,
    rating3Count: dto.rating_3_count || 0,
    rating2Count: dto.rating_2_count || 0,
    rating1Count: dto.rating_1_count || 0,
    averageCleanliness: dto.avg_cleanliness || null,
    averageEquipment: dto.avg_equipment || null,
    averageStaff: dto.avg_staff || null,
    averageValue: dto.avg_value || null,
    lastReviewDate: dto.last_review_date || dto.last_updated ? new Date(dto.last_review_date || dto.last_updated!) : null,
    updatedAt: dto.updated_at || dto.last_updated ? new Date(dto.updated_at || dto.last_updated!) : new Date(),
  };
}

/**
 * Mapea respuesta paginada del backend a PaginatedReviews entity
 */
export function mapPaginatedReviewsResponseToEntity(
  response: PaginatedReviewsResponseDTO
): PaginatedReviews {
  return {
    items: response.items ? mapReviewDTOsToEntities(response.items) : [],
    page: response.page,
    limit: response.limit,
    total: response.total,
    totalPages: response.totalPages,
  };
}

/**
 * Mapea CreateReviewData del dominio a CreateReviewRequestDTO para el backend
 * IMPORTANTE: Solo incluye campos que tienen valor (omite undefined)
 */
export function mapCreateReviewDataToRequestDTO(
  data: CreateReviewData
): CreateReviewRequestDTO {
  const dto: CreateReviewRequestDTO = {
    id_gym: data.gymId,
    rating: data.rating,
  };

  // Solo agregar campos opcionales si tienen valor definido
  if (data.title !== undefined && data.title !== null && data.title.trim() !== '') {
    dto.title = data.title;
  }
  if (data.comment !== undefined && data.comment !== null && data.comment.trim() !== '') {
    dto.comment = data.comment;
  }
  if (data.cleanlinessRating !== undefined && data.cleanlinessRating !== null && data.cleanlinessRating > 0) {
    dto.cleanliness_rating = data.cleanlinessRating;
  }
  if (data.equipmentRating !== undefined && data.equipmentRating !== null && data.equipmentRating > 0) {
    dto.equipment_rating = data.equipmentRating;
  }
  if (data.staffRating !== undefined && data.staffRating !== null && data.staffRating > 0) {
    dto.staff_rating = data.staffRating;
  }
  if (data.valueRating !== undefined && data.valueRating !== null && data.valueRating > 0) {
    dto.value_rating = data.valueRating;
  }

  return dto;
}

/**
 * Mapea UpdateReviewData del dominio a UpdateReviewRequestDTO para el backend
 * IMPORTANTE: Solo incluye campos que tienen valor (omite undefined)
 */
export function mapUpdateReviewDataToRequestDTO(
  data: UpdateReviewData
): UpdateReviewRequestDTO {
  const dto: UpdateReviewRequestDTO = {};

  // Solo agregar campos que tienen valor definido
  if (data.rating !== undefined && data.rating !== null) {
    dto.rating = data.rating;
  }
  if (data.title !== undefined && data.title !== null && data.title.trim() !== '') {
    dto.title = data.title;
  }
  if (data.comment !== undefined && data.comment !== null && data.comment.trim() !== '') {
    dto.comment = data.comment;
  }
  if (data.cleanlinessRating !== undefined && data.cleanlinessRating !== null && data.cleanlinessRating > 0) {
    dto.cleanliness_rating = data.cleanlinessRating;
  }
  if (data.equipmentRating !== undefined && data.equipmentRating !== null && data.equipmentRating > 0) {
    dto.equipment_rating = data.equipmentRating;
  }
  if (data.staffRating !== undefined && data.staffRating !== null && data.staffRating > 0) {
    dto.staff_rating = data.staffRating;
  }
  if (data.valueRating !== undefined && data.valueRating !== null && data.valueRating > 0) {
    dto.value_rating = data.valueRating;
  }

  return dto;
}
