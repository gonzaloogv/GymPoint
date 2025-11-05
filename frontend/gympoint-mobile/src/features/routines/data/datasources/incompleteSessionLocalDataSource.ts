import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Data source local para gestionar sesiones de entrenamiento incompletas
 * Usa AsyncStorage para persistencia
 */

const INCOMPLETE_SESSION_KEY = '@GymPoint:incompleteSession';

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
