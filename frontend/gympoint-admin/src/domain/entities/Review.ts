/**
 * Review de Gimnasio
 */
export interface Review {
  id_review: number;
  id_user: number;
  id_gym: number;
  rating: number; // 1-5
  comment: string | null;
  review_date: string; // ISO date
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id_user: number;
    name: string;
    email: string;
  };
  gym?: {
    id_gym: number;
    name: string;
    city: string;
  };
}

/**
 * Estadísticas de reviews
 */
export interface ReviewStats {
  total_reviews: number;
  avg_rating: number;
  total_approved: number;
  total_pending: number;
  rating_distribution: {
    rating_1: number;
    rating_2: number;
    rating_3: number;
    rating_4: number;
    rating_5: number;
  };
}

/**
 * DTO para aprobar/rechazar review
 */
export interface ApproveReviewDTO {
  id_review: number;
  is_approved: boolean;
}


