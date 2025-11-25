/**
 * ExecutionSession - Entidades para la ejecución de rutinas
 * Define las estructuras de datos usadas durante la ejecución activa de una rutina
 */

/**
 * SetExecution - Representa una serie durante la ejecución
 */
export interface SetExecution {
  setNumber: number; // Número de la serie (1, 2, 3, ...)
  previousWeight: number; // Peso usado en la sesión anterior
  previousReps: number; // Reps usadas en la sesión anterior
  currentWeight: number; // Peso actual que el usuario está usando
  currentReps: number; // Reps actuales que el usuario está registrando
  isDone: boolean; // Si la serie fue completada
}

/**
 * CompletionStats - Estadísticas al finalizar una rutina
 */
export interface CompletionStats {
  workoutSessionId: number; // ID de la sesión en el backend
  routineId: number;
  routineName: string;
  duration: number; // Duración en segundos
  totalVolume: number; // Volumen total en kg
  setsCompleted: number; // Series completadas
  totalSets: number; // Total de series
  streak?: number; // Racha de días consecutivos
  tokensEarned?: number; // Tokens ganados (si aplica)
}
