import { useState, useEffect } from 'react';
import { DI } from '@di/container';
import { ExerciseProgressDetail } from '@features/progress/domain/entities';

export const useExerciseProgress = (userId: string) => {
  const [exercises, setExercises] = useState<ExerciseProgressDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExerciseProgress = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await DI.getExerciseProgress.execute(userId);
        setExercises(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar progreso de ejercicios');
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseProgress();
  }, [userId]);

  return {
    exercises,
    loading,
    error,
  };
};
