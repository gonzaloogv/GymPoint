import { Review, ReviewStats, ApproveReviewDTO } from '../entities';

export interface ReviewRepository {
  getAllReviews(filters: { limit?: number; offset?: number; is_approved?: boolean; sortBy?: string; order?: string; searchTerm?: string }): Promise<{ total: number, reviews: Review[] }>;
  getReviewStats(): Promise<ReviewStats>;
  approveReview(data: ApproveReviewDTO): Promise<Review>;
  deleteReview(id: number): Promise<void>;
}


