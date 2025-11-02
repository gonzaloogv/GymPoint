import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExecutionSession } from '../../domain/entities/ExecutionSession';

/**
 * Data source local para gestionar sesiones de entrenamiento incompletas
 * Usa AsyncStorage para persistencia
 */

const INCOMPLETE_SESSION_KEY = '@GymPoint:incompleteSession';

export interface IIncompleteSessionLocalDataSource {
  saveIncompleteSession(session: ExecutionSession): Promise<void>;
  getIncompleteSession(): Promise<ExecutionSession | null>;
  clearIncompleteSession(): Promise<void>;
}

export class IncompleteSessionLocalDataSource
  implements IIncompleteSessionLocalDataSource
{
  /**
   * Guarda una sesión incompleta en AsyncStorage
   */
  async saveIncompleteSession(session: ExecutionSession): Promise<void> {
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
   * @returns ExecutionSession si existe, null si no hay sesión guardada
   */
  async getIncompleteSession(): Promise<ExecutionSession | null> {
    try {
      const jsonString = await AsyncStorage.getItem(INCOMPLETE_SESSION_KEY);

      if (!jsonString) {
        return null;
      }

      const session: ExecutionSession = JSON.parse(jsonString);
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
