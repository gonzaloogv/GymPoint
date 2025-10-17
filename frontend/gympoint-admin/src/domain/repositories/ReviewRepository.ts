import { Review, ReviewStats, ApproveReviewDTO } from '../entities';

export interface ReviewRepository {
  getAllReviews(): Promise<Review[]>;
  getReviewStats(): Promise<ReviewStats>;
  approveReview(data: ApproveReviewDTO): Promise<Review>;
  deleteReview(id: number): Promise<void>;
}


