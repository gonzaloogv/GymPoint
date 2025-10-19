import { ReviewRepository, Review, ReviewStats, ApproveReviewDTO } from '@/domain';
import { apiClient } from '../api';

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
    const response = await apiClient.get<{ message: string; data: { total: number; reviews: Review[] } }>(
      '/admin/reviews',
      { params: buildQueryParams(filters) }
    );
    return response.data.data;
  }

  async getReviewStats(): Promise<ReviewStats> {
    const response = await apiClient.get<{ message: string; data: ReviewStats }>('/admin/reviews/stats');
    return response.data.data;
  }

  async approveReview(data: ApproveReviewDTO): Promise<Review> {
    const { id_review, is_approved } = data;
    const response = await apiClient.put<{ message: string; data: Review }>(
      `/admin/reviews/${id_review}/approve`,
      { is_approved }
    );
    return response.data.data;
  }

  async deleteReview(id: number): Promise<void> {
    await apiClient.delete(`/admin/reviews/${id}`);
  }
}
