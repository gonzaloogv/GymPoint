/**
 * Review Domain Entity
 * Entidad de dominio para reseñas de gimnasios
 */

export interface ReviewAuthor {
  id: number;
  name: string;
  lastname?: string;
  profilePictureUrl: string | null;
}

export interface ReviewGym {
  id: number;
  name: string;
  city: string | null;
}

export interface Review {
  id: number;
  gymId: number;
  userId: number;
  rating: number; // 1.0-5.0
  title: string | null;
  comment: string | null;

  // Ratings por categoría
  cleanlinessRating: number | null; // 1-5
  equipmentRating: number | null; // 1-5
  staffRating: number | null; // 1-5
  valueRating: number | null; // 1-5

  // Metadata
  helpfulCount: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relaciones opcionales
  author?: ReviewAuthor;
  gym?: ReviewGym;
}

export interface RatingStats {
  gymId: number;
  averageRating: number;
  totalReviews: number;

  // Distribución por estrellas
  rating5Count: number;
  rating4Count: number;
  rating3Count: number;
  rating2Count: number;
  rating1Count: number;

  // Promedios por categoría
  averageCleanliness: number | null;
  averageEquipment: number | null;
  averageStaff: number | null;
  averageValue: number | null;

  lastReviewDate: Date | null;
  updatedAt: Date;
}

export interface PaginatedReviews {
  items: Review[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateReviewData {
  gymId: number;
  rating: number; // 1-5
  title?: string;
  comment?: string;
  cleanlinessRating?: number;
  equipmentRating?: number;
  staffRating?: number;
  valueRating?: number;
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  cleanlinessRating?: number;
  equipmentRating?: number;
  staffRating?: number;
  valueRating?: number;
}
