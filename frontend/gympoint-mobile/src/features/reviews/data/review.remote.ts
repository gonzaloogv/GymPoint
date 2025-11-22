import { api } from '../../../shared/http/apiClient';
import {
  CreateReviewRequestDTO,
  UpdateReviewRequestDTO,
  ReviewResponseDTO,
  PaginatedReviewsResponseDTO,
  RatingStatsResponseDTO,
  ListReviewsQueryParams,
} from './dto/review.api.dto';

/**
 * Reviews API Client
 * Base paths (OpenAPI compliant):
 * - /api/gyms/:gymId/reviews (list, create reviews, stats)
 * - /api/reviews/:reviewId (update, delete, helpful - legacy endpoints)
 */
export const ReviewRemote = {
  /**
   * GET /api/gyms/:gymId/reviews
   * Listar reseñas de un gimnasio (público)
   * OpenAPI compliant route
   */
  listGymReviews: (gymId: number, params?: ListReviewsQueryParams) =>
    api
      .get<PaginatedReviewsResponseDTO>(`/api/gyms/${gymId}/reviews`, {
        params: params?.order
          ? { ...params, order: params.order.toLowerCase() as 'asc' | 'desc' }
          : params,
      })
      .then((r) => r.data),

  /**
   * GET /api/gyms/:gymId/reviews/stats
   * Obtener estadísticas de rating de un gimnasio (público)
   * OpenAPI compliant route
   */
  getGymRatingStats: (gymId: number) =>
    api
      .get<RatingStatsResponseDTO>(`/api/gyms/${gymId}/reviews/stats`)
      .then((r) => r.data),

  /**
   * POST /api/gyms/:gymId/reviews
   * Crear una nueva reseña (requiere autenticación y asistencia previa al gym)
   * OpenAPI compliant route
   */
  createReview: (payload: CreateReviewRequestDTO) => {
    const gymId = payload.id_gym;
    const url = `/api/gyms/${gymId}/reviews`;

    // Crear body sin id_gym (ya está en la URL)
    const { id_gym, ...body } = payload;

    return api
      .post<ReviewResponseDTO>(url, body)
      .then((r) => r.data);
  },

  /**
   * PATCH /api/gym-reviews/:reviewId
   * Actualizar una reseña existente (solo el autor o admin)
   */
  updateReview: (reviewId: number, payload: UpdateReviewRequestDTO) =>
    api
      .patch<ReviewResponseDTO>(`/api/gym-reviews/${reviewId}`, payload)
      .then((r) => r.data),

  /**
   * DELETE /api/gym-reviews/:reviewId
   * Eliminar una reseña (solo el autor o admin)
   */
  deleteReview: (reviewId: number) =>
    api
      .delete<{ message: string }>(`/api/gym-reviews/${reviewId}`)
      .then((r) => r.data),

  /**
   * POST /api/reviews/:id_review/helpful
   * Marcar una reseña como útil
   */
  markReviewHelpful: (reviewId: number) => {
    const url = `/api/reviews/${reviewId}/helpful`;
    console.log('[REVIEW-REMOTE] markReviewHelpful called with reviewId:', reviewId);
    console.log('[REVIEW-REMOTE] POST URL:', url);
    return api
      .post<{ message: string }>(url)
      .then((r) => {
        console.log('[REVIEW-REMOTE] markReviewHelpful SUCCESS:', r.data);
        return r.data;
      })
      .catch((err) => {
        console.error('[REVIEW-REMOTE] markReviewHelpful ERROR:', err.response?.status, err.response?.data);
        throw err;
      });
  },

  /**
   * DELETE /api/reviews/:id_review/helpful
   * Quitar el voto de útil de una reseña
   */
  unmarkReviewHelpful: (reviewId: number) =>
    api
      .delete<{ message: string }>(`/api/reviews/${reviewId}/helpful`)
      .then((r) => r.data),

  /**
   * GET /api/reviews/me
   * Obtener las reseñas del usuario actual (requiere autenticación)
   */
  getMyReviews: (params?: { page?: number; limit?: number }) =>
    api
      .get<PaginatedReviewsResponseDTO>('/api/reviews/me', { params })
      .then((r) => r.data),

  /**
   * GET /api/reviews/:id_review
   * Obtener una reseña específica por ID
   */
  getReviewById: (reviewId: number) =>
    api
      .get<ReviewResponseDTO>(`/api/reviews/${reviewId}`)
      .then((r) => r.data),
};
