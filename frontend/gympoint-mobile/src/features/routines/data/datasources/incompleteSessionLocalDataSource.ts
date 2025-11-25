import { userStorage } from '@shared/services/storage';

/**
 * Data source local para gestionar sesiones de entrenamiento incompletas
 * Usa UserScopedStorage para persistencia con aislamiento por usuario
 *
 * IMPORTANTE: Todos los datos están scoped al usuario actual (user_123, user_456, etc.)
 * Esto previene que usuarios del mismo dispositivo vean datos de otros usuarios.
 */

// Keys base (se les agrega prefijo de usuario automáticamente)
const INCOMPLETE_SESSION_KEY = 'incompleteSession';
const DB_VERSION_KEY = 'dbVersion';
const ROUTINE_CACHE_PREFIX = 'routineCache:';

export interface SetExecution {
  setNumber: number;
  previousWeight: number;
  previousReps: number;
  currentWeight: number;
  currentReps: number;
  isDone: boolean;
}

export interface ExerciseState {
  sets: SetExecution[];
}

export interface IncompleteSessionData {
  routineId: number;
  routineName: string;
  workoutSessionId: number; // ID de la sesión en el backend
  startedAt: string;
  duration: number; // Duración en segundos
  currentExerciseIndex: number;
  currentSet: number;
  completedSets: Array<{
    exerciseId: number;
    setNumber: number;
    reps?: number;
    weight?: number;
    completedAt: string;
  }>;
  // Nuevo: Estado completo de ejercicios con todos los checks
  exerciseStates?: { [exerciseId: string]: ExerciseState };
  expandedExercises?: { [exerciseId: string]: boolean };
}

export interface IIncompleteSessionLocalDataSource {
  saveIncompleteSession(session: IncompleteSessionData): Promise<void>;
  getIncompleteSession(): Promise<IncompleteSessionData | null>;
  clearIncompleteSession(): Promise<void>;
  clearAllRoutineData(): Promise<void>;
  checkAndUpdateDBVersion(currentVersion?: string): Promise<boolean>;
  getDBVersion(): Promise<string | null>;
  setDBVersion(version: string): Promise<void>;
}

export class IncompleteSessionLocalDataSource
  implements IIncompleteSessionLocalDataSource
{
  /**
   * Guarda una sesión incompleta con scope de usuario
   */
  async saveIncompleteSession(session: IncompleteSessionData): Promise<void> {
    try {
      const jsonString = JSON.stringify(session);
      await userStorage.setItem(INCOMPLETE_SESSION_KEY, jsonString);
    } catch (error) {
      console.error('[IncompleteSession] Error saving session:', error);
      throw new Error('Failed to save incomplete session');
    }
  }

  /**
   * Obtiene la sesión incompleta guardada del usuario actual
   * @returns IncompleteSessionData si existe, null si no hay sesión guardada
   */
  async getIncompleteSession(): Promise<IncompleteSessionData | null> {
    try {
      const jsonString = await userStorage.getItem(INCOMPLETE_SESSION_KEY);

      if (!jsonString) {
        return null;
      }

      const session: IncompleteSessionData = JSON.parse(jsonString);
      return session;
    } catch (error) {
      console.error('[IncompleteSession] Error retrieving session:', error);
      return null;
    }
  }

  /**
   * Limpia la sesión incompleta guardada del usuario actual
   * Se llama cuando:
   * - Usuario completa la rutina
   * - Usuario descarta la rutina
   * - Usuario elige no continuar la sesión anterior
   */
  async clearIncompleteSession(): Promise<void> {
    try {
      await userStorage.removeItem(INCOMPLETE_SESSION_KEY);
    } catch (error) {
      console.error('[IncompleteSession] Error clearing session:', error);
      throw new Error('Failed to clear incomplete session');
    }
  }

  /**
   * Limpia TODOS los datos de rutinas del usuario actual
   * Útil cuando se detecta que la BD fue reseteada
   *
   * NOTA: Para logout, usar userStorage.clearUserData() directamente
   */
  async clearAllRoutineData(): Promise<void> {
    try {
      console.log('[IncompleteSession] Clearing all routine data for current user...');

      // Limpiar incomplete session
      await userStorage.removeItem(INCOMPLETE_SESSION_KEY);

      // Limpiar DB version
      await userStorage.removeItem(DB_VERSION_KEY);

      // TODO: Si usamos cache de rutinas, limpiarlo aquí
      // Ejemplo: await userStorage.removeItem(ROUTINE_CACHE_PREFIX + routineId);

      console.log('[IncompleteSession] Routine data cleared successfully');
    } catch (error) {
      console.error('[IncompleteSession] Error clearing routine data:', error);
      throw new Error('Failed to clear all routine data');
    }
  }

  /**
   * Obtiene la versión de la BD guardada del usuario actual
   */
  async getDBVersion(): Promise<string | null> {
    try {
      return await userStorage.getItem(DB_VERSION_KEY);
    } catch (error) {
      console.error('[IncompleteSession] Error getting DB version:', error);
      return null;
    }
  }

  /**
   * Guarda la versión de la BD del usuario actual
   */
  async setDBVersion(version: string): Promise<void> {
    try {
      await userStorage.setItem(DB_VERSION_KEY, version);
      console.log(`[IncompleteSession] DB version set to: ${version}`);
    } catch (error) {
      console.error('[IncompleteSession] Error setting DB version:', error);
      throw new Error('Failed to set DB version');
    }
  }

  /**
   * Verifica si la versión de la BD cambió y limpia datos si es necesario
   * @param currentVersion - Versión actual de la BD (por ejemplo, un timestamp o hash)
   * @returns true si la versión cambió y se limpiaron los datos, false si no
   */
  async checkAndUpdateDBVersion(currentVersion?: string): Promise<boolean> {
    try {
      const savedVersion = await this.getDBVersion();

      // Si no hay versión guardada, es la primera vez
      if (!savedVersion && currentVersion) {
        await this.setDBVersion(currentVersion);
        console.log('[IncompleteSession] First time setup, version saved');
        return false;
      }

      // Si no proporcionamos versión actual, solo verificamos que exista
      if (!currentVersion) {
        return false;
      }

      // Si las versiones no coinciden, la BD fue reseteada
      if (savedVersion !== currentVersion) {
        console.log('[IncompleteSession] DB version mismatch - clearing all routine data', {
          saved: savedVersion,
          current: currentVersion
        });

        await this.clearAllRoutineData();
        await this.setDBVersion(currentVersion);

        return true;
      }

      return false;
    } catch (error) {
      console.error('[IncompleteSession] Error checking DB version:', error);
      return false;
    }
  }
}

// Create singleton instance
const dataSource = new IncompleteSessionLocalDataSource();

// Export individual functions for easy use in store
export const saveIncompleteSession = (session: IncompleteSessionData) =>
  dataSource.saveIncompleteSession(session);

export const getIncompleteSession = () =>
  dataSource.getIncompleteSession();

export const clearIncompleteSession = () =>
  dataSource.clearIncompleteSession();

export const clearAllRoutineData = () =>
  dataSource.clearAllRoutineData();

export const checkAndUpdateDBVersion = (currentVersion?: string) =>
  dataSource.checkAndUpdateDBVersion(currentVersion);

export const getDBVersion = () =>
  dataSource.getDBVersion();

export const setDBVersion = (version: string) =>
  dataSource.setDBVersion(version);
