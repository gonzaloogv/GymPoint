import { useState, useEffect, useCallback } from 'react';
import { ReviewRemote } from '../../data/review.remote';
import { mapPaginatedReviewsResponseToEntity } from '../../data/mappers/review.mapper';
import { Review, PaginatedReviews } from '../../domain/entities/Review';

export interface UseGymReviewsParams {
  gymId: number;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'rating' | 'helpful_count';
  order?: 'asc' | 'desc';
  minRating?: number;
  maxRating?: number;
  withCommentOnly?: boolean;
}

export interface UseGymReviewsResult {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadNextPage: () => Promise<void>;
  loadPreviousPage: () => Promise<void>;
}

/**
 * Hook para obtener y paginar las reseñas de un gimnasio
 */
export function useGymReviews(params: UseGymReviewsParams): UseGymReviewsResult {
  const {
    gymId,
    page: initialPage = 1,
    limit = 10,
    sortBy = 'created_at',
    order = 'desc',
    minRating,
    maxRating,
    withCommentOnly,
  } = params;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(
    async (pageNum: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const normalizedOrder = (order || 'desc').toLowerCase() as 'asc' | 'desc';

        const response = await ReviewRemote.listGymReviews(gymId, {
          page: pageNum,
          limit,
          sortBy,
          order: normalizedOrder,
          min_rating: minRating,
          max_rating: maxRating,
          with_comment_only: withCommentOnly,
        });

        const paginatedData = mapPaginatedReviewsResponseToEntity(response);

        setReviews(paginatedData.items);
        setPagination({
          page: paginatedData.page,
          limit: paginatedData.limit,
          total: paginatedData.total,
          totalPages: paginatedData.totalPages,
          hasNextPage: paginatedData.page < paginatedData.totalPages,
          hasPreviousPage: paginatedData.page > 1,
        });
      } catch (err: any) {
        console.error('[useGymReviews] Error al cargar reseñas:', err);
        setError(err.message || 'Error al cargar las reseñas');
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    },
    [gymId, limit, sortBy, order, minRating, maxRating, withCommentOnly]
  );

  useEffect(() => {
    fetchReviews(initialPage);
  }, [fetchReviews, initialPage]);

  const refetch = useCallback(async () => {
    await fetchReviews(pagination.page);
  }, [fetchReviews, pagination.page]);

  const loadNextPage = useCallback(async () => {
    if (pagination.hasNextPage) {
      await fetchReviews(pagination.page + 1);
    }
  }, [fetchReviews, pagination]);

  const loadPreviousPage = useCallback(async () => {
    if (pagination.hasPreviousPage) {
      await fetchReviews(pagination.page - 1);
    }
  }, [fetchReviews, pagination]);

  return {
    reviews,
    pagination,
    isLoading,
    error,
    refetch,
    loadNextPage,
    loadPreviousPage,
  };
}
