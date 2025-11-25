import { useCallback } from 'react';
import { workoutRepository } from '../../data/WorkoutRepositoryImpl';
import { CompletionStats } from '../../domain/entities/ExecutionSession';
import { clearIncompleteSession } from '../../data/datasources/incompleteSessionLocalDataSource';
import { useRoutinesStore } from '../state';

/**
 * Hook para guardar la sesión de rutina completada
 * Toma las estadísticas de finalización y las notas opcionales
 */
export const useSaveRoutineSession = () => {
  const discardSession = useRoutinesStore((state) => state.discardSession);
  const saveSession = useCallback(
    async (stats: CompletionStats, notes?: string) => {
      try {
        console.log('[saveSession] 💾 Guardando sesión completada');

        const requestData = {
          ended_at: new Date().toISOString(),
          notes: notes || undefined,
        };

        // Complete the workout session in the backend
        await workoutRepository.completeSession(stats.workoutSessionId, requestData);

        // Clear incomplete session from local storage AND store
        await clearIncompleteSession();
        await discardSession();

        console.log('[saveSession] ✅ Sesión guardada exitosamente');
      } catch (error: any) {
        console.error('[saveSession] ❌ Error:', error?.response?.data?.error?.message || error?.message);
        throw error;
      }
    },
    [discardSession]
  );

  return {
    saveSession,
  };
};
