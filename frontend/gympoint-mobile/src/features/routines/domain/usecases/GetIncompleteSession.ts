import { ExecutionSession } from '../entities/ExecutionSession';
import { IncompleteSessionLocalDataSource } from '../../data/datasources/incompleteSessionLocalDataSource';

/**
 * Use case para obtener la sesión de entrenamiento incompleta guardada
 * Se usa al inicializar la app para detectar si hay entrenamiento pendiente
 */
export class GetIncompleteSession {
  constructor(private localDataSource: IncompleteSessionLocalDataSource) {}

  /**
   * Obtiene la sesión incompleta guardada en AsyncStorage
   * @returns ExecutionSession si existe, null si no hay sesión pendiente
   */
  async execute(): Promise<ExecutionSession | null> {
    return await this.localDataSource.getIncompleteSession();
  }
}
