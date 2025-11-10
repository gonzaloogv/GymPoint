import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Data source local para gestionar sesiones de entrenamiento incompletas
 * Usa AsyncStorage para persistencia
 */

const INCOMPLETE_SESSION_KEY = '@GymPoint:incompleteSession';
const DB_VERSION_KEY = '@GymPoint:dbVersion';
const ROUTINE_CACHE_PREFIX = '@GymPoint:routineCache:';

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
   * Guarda una sesión incompleta en AsyncStorage
   */
  async saveIncompleteSession(session: IncompleteSessionData): Promise<void> {
    try {
      const jsonString = JSON.stringify(session);
      await AsyncStorage.setItem(INCOMPLETE_SESSION_KEY, jsonString);
    } catch (error) {
      console.error('Error saving incomplete session to AsyncStorage:', error);
      throw new Error('Failed to save incomplete session');
    }
  }

  /**
   * Obtiene la sesión incompleta guardada
   * @returns IncompleteSessionData si existe, null si no hay sesión guardada
   */
  async getIncompleteSession(): Promise<IncompleteSessionData | null> {
    try {
      const jsonString = await AsyncStorage.getItem(INCOMPLETE_SESSION_KEY);

      if (!jsonString) {
        return null;
      }

      const session: IncompleteSessionData = JSON.parse(jsonString);
      return session;
    } catch (error) {
      console.error('Error retrieving incomplete session from AsyncStorage:', error);
      return null;
    }
  }

  /**
   * Limpia la sesión incompleta guardada
   * Se llama cuando:
   * - Usuario completa la rutina
   * - Usuario descarta la rutina
   * - Usuario elige no continuar la sesión anterior
   */
  async clearIncompleteSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(INCOMPLETE_SESSION_KEY);
    } catch (error) {
      console.error('Error clearing incomplete session from AsyncStorage:', error);
      throw new Error('Failed to clear incomplete session');
    }
  }

  /**
   * Limpia TODOS los datos de rutinas guardados en AsyncStorage
   * Útil cuando se detecta que la BD fue reseteada o cuando el usuario cierra sesión
   */
  async clearAllRoutineData(): Promise<void> {
    try {
      console.log('[AsyncStorage] 🧹 Clearing all routine data...');

      // Get all keys
      const allKeys = await AsyncStorage.getAllKeys();

      // Filter keys related to routines and DB version
      const routineKeys = allKeys.filter(
        key =>
          key.startsWith(ROUTINE_CACHE_PREFIX) ||
          key === INCOMPLETE_SESSION_KEY ||
          key === DB_VERSION_KEY
      );

      // Remove all routine-related keys
      if (routineKeys.length > 0) {
        await AsyncStorage.multiRemove(routineKeys);
        console.log(`[AsyncStorage] ✅ Cleared ${routineKeys.length} routine-related keys`);
      } else {
        console.log('[AsyncStorage] ℹ️ No routine data to clear');
      }
    } catch (error) {
      console.error('[AsyncStorage] ❌ Error clearing all routine data:', error);
      throw new Error('Failed to clear all routine data');
    }
  }

  /**
   * Obtiene la versión de la BD guardada
   */
  async getDBVersion(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(DB_VERSION_KEY);
    } catch (error) {
      console.error('[AsyncStorage] Error getting DB version:', error);
      return null;
    }
  }

  /**
   * Guarda la versión de la BD
   */
  async setDBVersion(version: string): Promise<void> {
    try {
      await AsyncStorage.setItem(DB_VERSION_KEY, version);
      console.log(`[AsyncStorage] ✅ DB version set to: ${version}`);
    } catch (error) {
      console.error('[AsyncStorage] Error setting DB version:', error);
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
        console.log('[AsyncStorage] ℹ️ First time setup, version saved');
        return false;
      }

      // Si no proporcionamos versión actual, solo verificamos que exista
      if (!currentVersion) {
        return false;
      }

      // Si las versiones no coinciden, la BD fue reseteada
      if (savedVersion !== currentVersion) {
        console.log('[AsyncStorage] ⚠️ DB version mismatch - clearing all routine data', {
          saved: savedVersion,
          current: currentVersion
        });

        await this.clearAllRoutineData();
        await this.setDBVersion(currentVersion);

        return true;
      }

      return false;
    } catch (error) {
      console.error('[AsyncStorage] Error checking DB version:', error);
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
