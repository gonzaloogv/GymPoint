/**
 * Review API DTOs
 * Tipos alineados con backend OpenAPI
 */

/**
 * Review DTO desde el backend
 */
export interface ReviewDTO {
  id_review: number;
  id_gym: number;
  id_user_profile: number;
  rating: number; // 1.0-5.0
  title: string | null;
  comment: string | null;
  cleanliness_rating: number | null; // 1-5
  equipment_rating: number | null; // 1-5
  staff_rating: number | null; // 1-5
  value_rating: number | null; // 1-5
  helpful_count: number;
  is_verified: boolean;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  user?: {
    id_user_profile: number;
    name: string;
    lastname?: string;
    profile_picture_url: string | null;
  };
  gym?: {
    id_gym: number;
    name: string;
    city: string | null;
  };
}

/**
 * Request para crear review
 * POST /api/reviews
 */
export interface CreateReviewRequestDTO {
  id_gym: number;
  rating: number; // 1-5 (required)
  title?: string; // max 100 chars
  comment?: string; // max 2000 chars
  cleanliness_rating?: number; // 1-5
  equipment_rating?: number; // 1-5
  staff_rating?: number; // 1-5
  value_rating?: number; // 1-5
}

/**
 * Request para actualizar review
 * PATCH /api/reviews/:id_review
 */
export interface UpdateReviewRequestDTO {
  rating?: number;
  title?: string;
  comment?: string;
  cleanliness_rating?: number;
  equipment_rating?: number;
  staff_rating?: number;
  value_rating?: number;
}

/**
 * Response de crear/actualizar review
 */
export interface ReviewResponseDTO {
  message: string;
  data: ReviewDTO;
}

/**
 * Response paginada de reviews
 * GET /api/gyms/:gymId/reviews
 */
export interface PaginatedReviewsResponseDTO {
  items: ReviewDTO[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Estadísticas de rating de un gimnasio
 * GET /api/gyms/:gymId/reviews/stats
 * Backend puede retornar avg_rating o average_rating
 */
export interface RatingStatsDTO {
  id_gym: number;
  avg_rating?: number; // 0.00-5.00 (legacy)
  average_rating?: number; // 0.00-5.00 (actual)
  total_reviews: number;
  rating_5_count: number;
  rating_4_count: number;
  rating_3_count: number;
  rating_2_count: number;
  rating_1_count: number;
  avg_cleanliness: number | null;
  avg_equipment: number | null;
  avg_staff: number | null;
  avg_facilities?: number | null;
  avg_value: number | null;
  last_review_date?: string | null; // ISO datetime
  last_updated?: string | null; // ISO datetime (actual)
  updated_at?: string; // ISO datetime (legacy)
}

/**
 * Response de stats - Backend retorna directamente el objeto
 */
export interface RatingStatsResponseDTO extends RatingStatsDTO {}

/**
 * Query params para listar reviews
 */
export interface ListReviewsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'rating' | 'helpful_count' | 'updated_at';
  order?: 'ASC' | 'DESC';
  min_rating?: number;
  max_rating?: number;
  with_comment_only?: boolean;
}

/**
 * Error de validación de review
 */
export interface ReviewValidationError {
  error: {
    code: 'VALIDATION_ERROR' | 'REVIEW_EXISTS' | 'NO_ATTENDANCE' | 'UNAUTHORIZED';
    message: string;
    gymId?: number;
    reviewId?: number;
  };
}
