import { useEffect, useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';

import { Exercise } from '@features/routines/domain/entities';
import {
  ExecutionSession,
  ExerciseExecutionState,
  SetExecution,
  TimerState,
  CompletionStats,
} from '@features/routines/domain/entities/ExecutionSession';
import { useRoutineById } from './useRoutineById';
import { useIncompleteSession } from './useIncompleteSession';
import { useRoutineExecutionStats } from './useRoutineExecutionStats';

const MOTIVATIONAL_MESSAGES = [
  '¡Vamos! Siguiente Serie',
  '¡Listo! Siguiente Serie!',
  '¡Enfocado! Siguiente Serie',
];

type UseRoutineExecutionParams = {
  id?: string;
  restoreState?: ExecutionSession; // Para restaurar desde sesión incompleta
};

type UseRoutineExecutionResult = {
  // Metadata
  routineId: string;
  routineName: string;
  exercises: Exercise[];

  // Execution state
  exerciseStates: Record<string, ExerciseExecutionState>;
  expandedExercises: Record<string, boolean>;
  timerState: TimerState;
  currentTimerExerciseId?: string;

  // Stats (en tiempo real)
  duration: number;
  totalVolume: number;
  setsCompleted: number;
  totalSets: number;

  // Acciones
  toggleExerciseExpand: (exerciseId: string) => void;
  updateSet: (exerciseId: string, setIndex: number, data: Partial<SetExecution>) => void;
  addSet: (exerciseId: string) => void;
  markSetDone: (exerciseId: string, setIndex: number) => void;
  skipTimer: () => void;
  addExercise: (exerciseId: string) => void;
  completeRoutine: () => CompletionStats;
  discardRoutine: () => void;
};

/**
 * Hook principal para la ejecución de rutinas
 * Gestiona estado completo: ejercicios, series, timer, persistencia
 * ARQUITECTURA: Todos los ejercicios visibles, cada uno expandible
 */
export const useRoutineExecution = ({
  id,
  restoreState,
}: UseRoutineExecutionParams): UseRoutineExecutionResult => {
  // Datos básicos de la rutina
  const routine = useRoutineById(id);
  const exercises = routine.exercises;

  // Hooks de persistencia
  const { saveIncompleteSession, clearIncompleteSession } = useIncompleteSession();

  // Estado de ejecución
  const [exerciseStates, setExerciseStates] = useState<Record<string, ExerciseExecutionState>>(
    () => {
      if (restoreState?.exerciseStates) {
        return restoreState.exerciseStates;
      }

      // Inicializar estado para todos los ejercicios
      const initialState: Record<string, ExerciseExecutionState> = {};

      exercises.forEach((exercise) => {
        const totalSets = parseSets(exercise.sets);
        initialState[exercise.id] = {
          exerciseId: exercise.id,
          sets: Array.from({ length: totalSets }).map((_, i) => ({
            setNumber: i + 1,
            currentWeight: 0,
            currentReps: 0,
            isDone: false,
          })),
          lastCompletedSetIndex: -1,
        };
      });

      return initialState;
    }
  );

  // Estado de expansión (todos colapsados por defecto)
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>(
    () => restoreState?.expandedExercises ?? {}
  );

  // Estado del timer
  const [timerState, setTimerState] = useState<TimerState>(
    () => restoreState?.timerState ?? { type: 'initial', message: '¡No olvides el calentamiento!' }
  );
  const [currentTimerExerciseId, setCurrentTimerExerciseId] = useState<string | undefined>(
    restoreState?.currentTimerExerciseId
  );

  // Timestamp de inicio
  const [startTime] = useState<number>(() => restoreState?.startTime ?? Date.now());

  // Stats en tiempo real
  const stats = useRoutineExecutionStats(startTime, exerciseStates);

  // Contar total de sets en la rutina
  const totalSets = useMemo(() => {
    let count = 0;
    Object.values(exerciseStates).forEach((state) => {
      count += state.sets.length;
    });
    return count;
  }, [exerciseStates]);

  // ============ ACCIONES ============

  /**
   * Alternar expansión de un ejercicio
   */
  const toggleExerciseExpand = useCallback((exerciseId: string) => {
    setExpandedExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  }, []);

  /**
   * Actualizar datos de una serie (peso, reps, etc)
   */
  const updateSet = useCallback(
    (exerciseId: string, setIndex: number, data: Partial<SetExecution>) => {
      setExerciseStates((prev) => {
        const exState = prev[exerciseId];
        if (!exState) return prev;

        return {
          ...prev,
          [exerciseId]: {
            ...exState,
            sets: exState.sets.map((set, i) =>
              i === setIndex ? { ...set, ...data } : set
            ),
          },
        };
      });
    },
    []
  );

  /**
   * Agregar una serie al ejercicio
   */
  const addSet = useCallback((exerciseId: string) => {
    setExerciseStates((prev) => {
      const exState = prev[exerciseId];
      if (!exState) return prev;

      const newSetNumber = exState.sets.length + 1;
      const newSet: SetExecution = {
        setNumber: newSetNumber,
        currentWeight: 0,
        currentReps: 0,
        isDone: false,
      };

      return {
        ...prev,
        [exerciseId]: {
          ...exState,
          sets: [...exState.sets, newSet],
        },
      };
    });
  }, []);

  /**
   * Marcar una serie como completada
   * LÓGICA CRÍTICA: Inicia timer automáticamente
   */
  const markSetDone = useCallback((exerciseId: string, setIndex: number) => {
    setExerciseStates((prev) => {
      const exState = prev[exerciseId];
      if (!exState) return prev;

      const set = exState.sets[setIndex];
      if (!set) return prev;

      // Validar que peso y reps estén completados
      if (!set.currentWeight || set.currentWeight <= 0 || !set.currentReps || set.currentReps <= 0) {
        Alert.alert(
          'Datos incompletos',
          'Por favor completa el peso y las repeticiones antes de marcar esta serie como hecha.'
        );
        return prev;
      }

      // Marcar serie como done
      const updatedSets = exState.sets.map((s, i) =>
        i === setIndex ? { ...s, isDone: true } : s
      );

      // Iniciar timer automáticamente para este ejercicio
      const exercise = exercises.find((e) => e.id === exerciseId);
      if (exercise) {
        // Ocultar mensaje anterior si hay
        if (timerState.type === 'completed') {
          setTimerState({ type: 'idle' });
        }

        // Iniciar nuevo timer
        setCurrentTimerExerciseId(exerciseId);
        setTimerState({
          type: 'active',
          seconds: exercise.rest || 0,
          exerciseName: exercise.name,
        });
      }

      return {
        ...prev,
        [exerciseId]: {
          ...exState,
          sets: updatedSets,
          lastCompletedSetIndex: setIndex,
        },
      };
    });
  }, [exercises, timerState]);

  /**
   * Saltar timer de descanso
   */
  const skipTimer = useCallback(() => {
    setTimerState({ type: 'idle' });
    setCurrentTimerExerciseId(undefined);
  }, []);

  /**
   * Agregar ejercicio durante la ejecución
   */
  const addExercise = useCallback((exerciseId: string) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise || exerciseStates[exerciseId]) {
      return; // Ya existe o no encontrado
    }

    const totalSets = parseSets(exercise.sets);
    setExerciseStates((prev) => ({
      ...prev,
      [exerciseId]: {
        exerciseId: exercise.id,
        sets: Array.from({ length: totalSets }).map((_, i) => ({
          setNumber: i + 1,
          currentWeight: 0,
          currentReps: 0,
          isDone: false,
        })),
        lastCompletedSetIndex: -1,
      },
    }));
  }, [exercises, exerciseStates]);

  /**
   * Completar la rutina y retornar stats
   */
  const completeRoutine = useCallback((): CompletionStats => {
    clearIncompleteSession();

    return {
      routineId: id || '',
      routineName: routine.name,
      duration: stats.duration,
      totalVolume: stats.totalVolume,
      setsCompleted: stats.setsCompleted,
      totalSets: stats.totalSets,
    };
  }, [id, routine.name, stats, clearIncompleteSession]);

  /**
   * Descartar la rutina sin guardar
   */
  const discardRoutine = useCallback(() => {
    clearIncompleteSession();
    setExerciseStates({});
    setTimerState({ type: 'idle' });
  }, [clearIncompleteSession]);

  // ============ SIDE EFFECTS ============

  /**
   * Timer countdown - Disminuye segundos cuando está activo
   */
  useEffect(() => {
    if (timerState.type !== 'active') return;

    const interval = setInterval(() => {
      setTimerState((prev) => {
        if (prev.type !== 'active') return prev;

        const newSeconds = prev.seconds - 1;

        if (newSeconds <= 0) {
          // Mostrar mensaje motivacional
          return {
            type: 'completed',
            message: MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)],
          };
        }

        return { ...prev, seconds: newSeconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState]);

  /**
   * Persistencia: Guardar estado a AsyncStorage cada vez que cambia
   * Debounce de 1 segundo para no grabar constantemente
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      const session: ExecutionSession = {
        id: `session-${Date.now()}`,
        routineId: id || '',
        routineName: routine.name,
        startTime,
        exerciseStates,
        expandedExercises,
        timerState,
        currentTimerExerciseId,
        isIncomplete: true,
      };

      saveIncompleteSession(session);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [
    exerciseStates,
    expandedExercises,
    timerState,
    currentTimerExerciseId,
    id,
    routine.name,
    startTime,
    saveIncompleteSession,
  ]);

  return {
    // Metadata
    routineId: id || '',
    routineName: routine.name,
    exercises,

    // State
    exerciseStates,
    expandedExercises,
    timerState,
    currentTimerExerciseId,

    // Stats
    duration: stats.duration,
    totalVolume: stats.totalVolume,
    setsCompleted: stats.setsCompleted,
    totalSets,

    // Actions
    toggleExerciseExpand,
    updateSet,
    addSet,
    markSetDone,
    skipTimer,
    addExercise,
    completeRoutine,
    discardRoutine,
  };
};

/**
 * Función auxiliar para parsear número de sets
 */
function parseSets(sets: number | string): number {
  if (typeof sets === 'number') {
    return sets;
  }
  const parsed = parseInt(String(sets), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}
