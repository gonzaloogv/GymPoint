import { useState, useEffect, useCallback } from 'react';
import { ReviewRemote } from '../../data/review.remote';
import { mapRatingStatsDTOToEntity } from '../../data/mappers/review.mapper';
import { RatingStats } from '../../domain/entities/Review';

export interface UseGymRatingStatsResult {
  stats: RatingStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener las estadísticas de rating de un gimnasio
 */
export function useGymRatingStats(gymId: number): UseGymRatingStatsResult {
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await ReviewRemote.getGymRatingStats(gymId);
      // Backend retorna directamente el objeto, no dentro de { data: ... }
      const statsEntity = mapRatingStatsDTOToEntity(response);
      setStats(statsEntity);
    } catch (err: any) {
      console.error('[useGymRatingStats] Error al cargar estadísticas:', err);
      setError(err.message || 'Error al cargar las estadísticas de rating');
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [gymId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
