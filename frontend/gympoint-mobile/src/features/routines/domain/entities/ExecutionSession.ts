/**
 * ExecutionSession - Estado en tiempo real de una sesión de entrenamiento
 * Separación clara: Exercise (config) vs ExecutionSession (runtime state)
 */

/**
 * Estados del temporizador de descanso
 */
export type TimerState =
  | {
      type: 'initial';
      message: string;
    }
  | {
      type: 'active';
      seconds: number;
      exerciseName: string;
    }
  | {
      type: 'completed';
      message: string;
    }
  | {
      type: 'idle';
    };

/**
 * Datos de una serie completada durante la ejecución
 */
export interface SetExecution {
  setNumber: number;
  previousWeight?: number; // Del historial anterior
  previousReps?: number; // Del historial anterior
  currentWeight: number; // Lo que realmente levantó
  currentReps: number; // Lo que realmente hizo
  isDone: boolean; // Marcado como completado
}

/**
 * Estado de ejecución de un ejercicio específico
 */
export interface ExerciseExecutionState {
  exerciseId: string;
  sets: SetExecution[];
  lastCompletedSetIndex: number; // Para tracking
}

/**
 * Sesión de entrenamiento en progreso
 * Se persiste en AsyncStorage para recuperar si se interrumpe
 */
export interface ExecutionSession {
  id: string; // UUID generado al iniciar
  routineId: string;
  routineName: string;
  startTime: number; // timestamp en ms
  endTime?: number; // timestamp cuando completa (opcional)

  // Estado actual de cada ejercicio
  exerciseStates: Record<string, ExerciseExecutionState>;

  // Cuáles ejercicios están expandidos
  expandedExercises: Record<string, boolean>;

  // Estado del temporizador global
  timerState: TimerState;
  currentTimerExerciseId?: string; // Qué ejercicio tiene el timer activo

  // Flag: ¿se guardó pero no se completó?
  isIncomplete: boolean;
}

/**
 * Datos que retorna completeRoutine() para navegar a RoutineCompletedScreen
 */
export interface CompletionStats {
  routineId: string;
  routineName: string;
  duration: number; // segundos totales
  totalVolume: number; // kg levantados
  setsCompleted: number;
  totalSets: number;
  streak?: number; // días consecutivos (del backend)
  tokensEarned?: number;
}