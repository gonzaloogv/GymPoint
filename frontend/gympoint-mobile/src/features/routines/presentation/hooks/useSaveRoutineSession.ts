import { useCallback } from 'react';
import { RoutineSession, SetLog } from '@features/routines/domain/entities';
import { CompletionStats } from '@features/routines/domain/entities/ExecutionSession';
import { DI } from '@di/container';

/**
 * Hook para guardar una sesión de rutina completada
 * Convierte CompletionStats (del execution) a RoutineSession (para historial)
 */
export const useSaveRoutineSession = () => {
  const saveSession = useCallback(
    async (stats: CompletionStats, notes?: string): Promise<void> => {
      try {
        // Crear RoutineSession a partir de CompletionStats
        const session: RoutineSession = {
          id: `session-${Date.now()}`,
          routineId: stats.routineId,
          date: new Date().toISOString(),
          durationMin: Math.round(stats.duration / 60), // Convertir segundos a minutos
          completed: true,
          notes: notes,
          logs: [], // TODO: Esto debería venir de los exerciseStates completados
        };

        // Guardar usando el use case
        await DI.saveRoutineSession.execute(session);
      } catch (error) {
        console.error('Error saving routine session:', error);
        throw error;
      }
    },
    [],
  );

  return { saveSession };
};
