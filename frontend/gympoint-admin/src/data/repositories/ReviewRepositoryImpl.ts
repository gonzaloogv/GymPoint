import { ReviewRepository, Review, ReviewStats, ApproveReviewDTO } from '@/domain';
import { apiClient } from '../api';

export class ReviewRepositoryImpl implements ReviewRepository {
  async getAllReviews(): Promise<Review[]> {
    const response = await apiClient.get<{ message: string; data: Review[] }>('/admin/reviews');
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


