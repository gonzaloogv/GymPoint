/**
 * LoggerService - Servicio de logging estructurado
 *
 * Propósito:
 * - Reemplazar console.log directo con API estructurada
 * - Desactivar logs en producción (mejora performance)
 * - Facilitar integración con servicios de tracking (Sentry, etc.)
 * - Logs tipados y categorizados
 *
 * Uso:
 * ```ts
 * import { logger } from '@shared/services/logger';
 *
 * logger.debug('User action', { userId: 123, action: 'click' });
 * logger.info('Operation completed successfully');
 * logger.error('Failed to fetch data', error);
 * ```
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  context?: string;
}

export class LoggerService {
  private enabled: boolean;
  private context?: string;

  constructor(context?: string, enabled: boolean = __DEV__) {
    this.context = context;
    this.enabled = enabled;
  }

  /**
   * Crea un logger con contexto específico
   * Útil para identificar el origen de los logs
   *
   * @param context - Identificador del módulo/feature (ej: "RoutinesStore", "AuthService")
   */
  withContext(context: string): LoggerService {
    return new LoggerService(context, this.enabled);
  }

  /**
   * Log nivel DEBUG - Solo en desarrollo
   * Usar para debugging detallado, flujo de ejecución, estado interno
   */
  debug(message: string, data?: any): void {
    if (!this.enabled) return;

    const prefix = this.context ? `[${this.context}]` : '';
    console.log(`${prefix} [DEBUG] ${message}`, data !== undefined ? data : '');
  }

  /**
   * Log nivel INFO - Solo en desarrollo
   * Usar para operaciones importantes, milestones, confirmaciones
   */
  info(message: string, data?: any): void {
    if (!this.enabled) return;

    const prefix = this.context ? `[${this.context}]` : '';
    console.info(`${prefix} [INFO] ${message}`, data !== undefined ? data : '');
  }

  /**
   * Log nivel WARN - En desarrollo y producción
   * Usar para situaciones inesperadas pero recuperables
   */
  warn(message: string, data?: any): void {
    const prefix = this.context ? `[${this.context}]` : '';
    console.warn(`${prefix} [WARN] ${message}`, data !== undefined ? data : '');
  }

  /**
   * Log nivel ERROR - En desarrollo y producción
   * Usar para errores, excepciones, fallos críticos
   *
   * En producción, estos logs deberían enviarse a servicio de tracking
   */
  error(message: string, error?: any): void {
    const prefix = this.context ? `[${this.context}]` : '';
    console.error(`${prefix} [ERROR] ${message}`, error);

    // TODO: En producción, enviar a servicio de error tracking
    // Example: Sentry.captureException(error, { extra: { message, context: this.context } });
  }

  /**
   * Medir performance de una operación
   * Útil para identificar cuellos de botella
   */
  async measurePerformance<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    this.debug(`Starting: ${operation}`);

    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.info(`Completed: ${operation}`, { duration: `${duration}ms` });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`Failed: ${operation}`, { duration: `${duration}ms`, error });
      throw error;
    }
  }

  /**
   * Crear una entrada de log estructurada
   * Útil para logs que necesitan ser procesados o enviados a servicios externos
   */
  createEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      context: this.context,
    };
  }

  /**
   * Habilitar/deshabilitar logs dinámicamente
   * Útil para debugging en producción (con feature flag)
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Verificar si el logger está habilitado
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance (general purpose)
export const logger = new LoggerService();

// Export contextualized instances for common modules
export const authLogger = new LoggerService('Auth');
export const routinesLogger = new LoggerService('Routines');
export const workoutLogger = new LoggerService('Workout');
export const storageLogger = new LoggerService('Storage');
export const apiLogger = new LoggerService('API');
