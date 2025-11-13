export interface Review {
  id_review: number;
  id_user_profile: number;
  id_gym: number;
  rating: number;
  title?: string | null;
  comment?: string | null;
  cleanliness_rating?: number | null;
  equipment_rating?: number | null;
  staff_rating?: number | null;
  value_rating?: number | null;
  helpful_count: number;
  reported: boolean;
  is_approved: boolean;
  review_date: string;
  created_at: string;
  updated_at: string;
  user?: {
    id_user_profile: number;
    name: string;
    email: string | null;
  };
  gym?: {
    id_gym: number;
    name: string;
    city?: string | null;
  };
}

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

export interface ApproveReviewDTO {
  id_review: number;
  is_approved: boolean;
}

