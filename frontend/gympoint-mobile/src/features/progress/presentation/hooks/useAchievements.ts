import { useState, useEffect } from 'react';
import { DI } from '@di/container';
import { Achievement } from '@features/progress/domain/entities/Progress';

export const useAchievements = (userId: string) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await DI.getAchievements.execute(userId);
        setAchievements(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar logros');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [userId]);

  return {
    achievements,
    loading,
    error,
  };
};
