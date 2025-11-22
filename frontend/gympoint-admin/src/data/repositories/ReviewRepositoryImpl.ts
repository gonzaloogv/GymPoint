import { ReviewRepository, Review, ReviewStats, ApproveReviewDTO } from '@/domain';
import { apiClient } from '../api';
import { GymReviewResponse, PaginatedGymReviewsResponse } from '../dto/types';
import { mapGymReviewResponseToReview } from '../mappers/CommonMappers';

type ReviewFilters = {
  limit?: number;
  offset?: number;
  is_approved?: boolean;
  sortBy?: string;
  order?: string;
  searchTerm?: string;
};

const buildQueryParams = (filters: ReviewFilters) => {
  const entries = Object.entries({
    limit: filters.limit,
    offset: filters.offset,
    sortBy: filters.sortBy,
    order: filters.order,
    searchTerm: filters.searchTerm,
    is_approved: filters.is_approved !== undefined ? String(filters.is_approved) : undefined,
  }).filter(([, value]) => value !== undefined && value !== null && value !== '');

  return Object.fromEntries(entries);
};

export class ReviewRepositoryImpl implements ReviewRepository {
  async getAllReviews(
    filters: ReviewFilters = {}
  ): Promise<{ total: number; reviews: Review[] }> {
    // Admin endpoint incluye datos enriquecidos (usuario, gimnasio, aprobado)
    const response = await apiClient.get<{ message: string; data: { total: number; reviews: GymReviewResponse[] } }>(
      '/admin/reviews',
      { params: buildQueryParams(filters) }
    );

    const payload = response.data?.data || { total: 0, reviews: [] };
    return {
      total: payload.total,
      reviews: payload.reviews.map(mapGymReviewResponseToReview),
    };
  }

  async getReviewStats(): Promise<ReviewStats> {
    // TODO: Agregar endpoint de stats al OpenAPI
    const response = await apiClient.get<{ message: string; data: ReviewStats }>('/admin/reviews/stats');
    return response.data.data;
  }

  async approveReview(data: ApproveReviewDTO): Promise<Review> {
    const { id_review, is_approved } = data;
    const response = await apiClient.put<GymReviewResponse>(
      `/admin/reviews/${id_review}/approve`,
      { is_approved }
    );
    return mapGymReviewResponseToReview(response.data);
  }

  async deleteReview(id: number): Promise<void> {
    await apiClient.delete(`/admin/reviews/${id}`);
  }
}
