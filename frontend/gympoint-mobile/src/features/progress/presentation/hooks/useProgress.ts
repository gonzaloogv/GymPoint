import { useEffect } from 'react';
import { useProgressStore } from '../state/progress.store';
import { DI } from '@di/container';

export const useProgress = (userId: string) => {
  const { progress, loading, error, setProgress, setLoading, setError } =
    useProgressStore();

  useEffect(() => {
    const fetchProgress = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const data = await DI.getProgress.execute(userId);
        setProgress(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar progreso');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userId]);

  return {
    progress,
    loading,
    error,
  };
};
