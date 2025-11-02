import { useCallback } from 'react';
import { DI } from '@di/container';
import { ExecutionSession } from '@features/routines/domain/entities/ExecutionSession';

interface UseIncompleteSessionResult {
  getIncompleteSession: () => Promise<ExecutionSession | null>;
  saveIncompleteSession: (session: ExecutionSession) => Promise<void>;
  clearIncompleteSession: () => Promise<void>;
}

/**
 * Hook para gestionar sesiones de entrenamiento incompletas
 * Encapsula la persistencia en AsyncStorage mediante el datasource local
 *
 * Métodos:
 * - getIncompleteSession(): Obtiene sesión guardada (null si no existe)
 * - saveIncompleteSession(session): Guarda sesión en AsyncStorage
 * - clearIncompleteSession(): Limpia la sesión guardada
 */
export function useIncompleteSession(): UseIncompleteSessionResult {
  // Obtener sesión incompleta
  const getIncompleteSession = useCallback(async (): Promise<ExecutionSession | null> => {
    try {
      return await DI.getIncompleteSession.execute();
    } catch (error) {
      console.error('Error getting incomplete session:', error);
      return null;
    }
  }, []);

  // Guardar sesión incompleta
  const saveIncompleteSession = useCallback(async (session: ExecutionSession): Promise<void> => {
    try {
      await DI.incompleteSessionLocalDataSource.saveIncompleteSession(session);
    } catch (error) {
      console.error('Error saving incomplete session:', error);
      // No lanzar error aquí, solo loguear - no debe romper la ejecución
    }
  }, []);

  // Limpiar sesión incompleta
  const clearIncompleteSession = useCallback(async (): Promise<void> => {
    try {
      await DI.incompleteSessionLocalDataSource.clearIncompleteSession();
    } catch (error) {
      console.error('Error clearing incomplete session:', error);
      // No lanzar error aquí, solo loguear
    }
  }, []);

  return {
    getIncompleteSession,
    saveIncompleteSession,
    clearIncompleteSession,
  };
}
