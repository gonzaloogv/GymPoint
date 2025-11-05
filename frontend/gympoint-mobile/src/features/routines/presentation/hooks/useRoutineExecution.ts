import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRoutinesStore } from '../state';
import { RoutineExercise } from '../../domain/entities';
import { SetExecution } from '../../domain/entities/ExecutionSession';
import { Exercise } from '../../domain/entities/Exercise';
import { workoutRepository } from '../../data/WorkoutRepositoryImpl';

type UseRoutineExecutionParams = {
  id?: string; // string from route params
  restoreState?: any; // state from incomplete session
};

type ExerciseState = {
  sets: SetExecution[];
};

type TimerState = 'idle' | 'running' | 'paused';

type UseRoutineExecutionResult = {
  routineId: number;
  routineName: string;
  exercises: Exercise[];
  exerciseStates: { [exerciseId: string]: ExerciseState };
  expandedExercises: { [exerciseId: string]: boolean };
  timerState: TimerState;
  currentTimerExerciseId: string | null;
  duration: number; // seconds since start
  totalVolume: number;
  setsCompleted: number;
  totalSets: number;
  toggleExerciseExpand: (exerciseId: string) => void;
  updateSet: (exerciseId: string, setIndex: number, data: Partial<SetExecution>) => void;
  addSet: (exerciseId: string) => void;
  markSetDone: (exerciseId: string, setIndex: number) => void;
  skipTimer: () => void;
  addExercise: (exerciseId: string) => void;
  completeRoutine: () => { duration: number; totalVolume: number; setsCompleted: number };
  discardRoutine: () => void;
};

/**
 * Hook para gestionar la ejecución de una rutina
 * Maneja el estado de ejercicios, sets, timer de descanso y métricas
 */
export const useRoutineExecution = ({
  id,
  restoreState,
}: UseRoutineExecutionParams): UseRoutineExecutionResult => {
  const {
    currentRoutine,
    executionState,
    startExecution,
    discardSession: storeDiscardSession,
    updateIncompleteSessionProgress,
    incompleteSession,
  } = useRoutinesStore();

  // Convert id to number
  const routineId = id ? parseInt(id, 10) : 0;

  // Exercise states - manages sets for each exercise
  const [exerciseStates, setExerciseStates] = useState<{ [exerciseId: string]: ExerciseState }>({});

  // Expanded exercises - which exercises are expanded in the UI
  const [expandedExercises, setExpandedExercises] = useState<{ [exerciseId: string]: boolean }>({});

  // Rest timer state
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [currentTimerExerciseId, setCurrentTimerExerciseId] = useState<string | null>(null);
  const [restSeconds, setRestSeconds] = useState(0);

  // Duration tracking
  const [duration, setDuration] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Flag to prevent re-initialization when dependencies change
  const hasInitializedExercisesRef = useRef<boolean>(false);

  const navigation = useNavigation();

  // Start execution on mount
  useEffect(() => {
    if (routineId) {
      startExecution(routineId).catch((error) => {
        if (error.message === 'PENDING_SESSION_EXISTS') {
          Alert.alert(
            'Entrenamiento pendiente',
            'Tienes un entrenamiento pendiente. Debes terminarlo o continuarlo antes de iniciar otra rutina.',
            [
              {
                text: 'Cancelar',
                style: 'cancel',
                onPress: () => navigation.goBack(),
              },
              {
                text: 'Ver pendientes',
                onPress: () => {
                  // Activate Pending filter and go back to routines list
                  const { setStatusFilter } = useRoutinesStore.getState();
                  setStatusFilter('Pending');
                  navigation.goBack();
                },
              },
            ]
          );
        } else if (error.message === 'ACTIVE_SESSION_EXISTS') {
          Alert.alert(
            'Entrenamiento pendiente',
            'Tienes un entrenamiento pendiente. Debes terminarlo o descartarlo antes de iniciar otra rutina.',
            [
              {
                text: 'Cancelar',
                style: 'cancel',
                onPress: () => navigation.goBack(),
              },
              {
                text: 'Ver pendientes',
                onPress: () => {
                  // Activate Pending filter and go back to routines list
                  const { setStatusFilter } = useRoutinesStore.getState();
                  setStatusFilter('Pending');
                  navigation.goBack();
                },
              },
            ]
          );
        } else {
          console.error('[useRoutineExecution] Error:', error);
          Alert.alert(
            'Error',
            'No se pudo iniciar el entrenamiento',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      });
      startTimeRef.current = Date.now();
    }
  }, [routineId, startExecution, navigation]);

  // Duration timer - updates every second
  useEffect(() => {
    durationIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setDuration(elapsed);
    }, 1000);

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  // Initialize exercise states when routine loads
  // CRITICAL: Only initialize ONCE to prevent overwriting restored state
  useEffect(() => {
    if (currentRoutine?.exercises && currentRoutine.exercises.length > 0) {
      // Skip if already initialized
      if (hasInitializedExercisesRef.current) {
        return;
      }

      // Always restore from incomplete session (which now has exercise states initialized by the store)
      if (incompleteSession?.exerciseStates) {
        console.log('[useRoutineExecution] ♻️ Restaurando progreso guardado desde incompleteSession');
        setExerciseStates(incompleteSession.exerciseStates);
        setExpandedExercises(incompleteSession.expandedExercises || {});
        setDuration(incompleteSession.duration || 0);
        startTimeRef.current = Date.now() - (incompleteSession.duration || 0) * 1000;
      } else {
        // This should not happen anymore since store initializes exercise states
        // But keep as fallback
        console.log('[useRoutineExecution] ⚠️ No exercise states in incompleteSession - this should not happen');
        const initialStates: { [exerciseId: string]: ExerciseState } = {};
        const initialExpanded: { [exerciseId: string]: boolean } = {};

        currentRoutine.exercises.forEach((exercise) => {
          const exerciseId = exercise.id_exercise.toString();
          const numSets = exercise.series || 3;
          const defaultReps = exercise.reps || 10;

          // Initialize sets for this exercise
          initialStates[exerciseId] = {
            sets: Array.from({ length: numSets }, (_, index): SetExecution => ({
              setNumber: index + 1,
              previousWeight: 0,
              previousReps: defaultReps,
              currentWeight: 0,
              currentReps: defaultReps,
              isDone: false,
            })),
          };

          initialExpanded[exerciseId] = false;
        });

        setExerciseStates(initialStates);
        setExpandedExercises(initialExpanded);
      }

      // Mark as initialized
      hasInitializedExercisesRef.current = true;
    }
  }, [currentRoutine, restoreState, incompleteSession, updateIncompleteSessionProgress]);

  // Auto-save duration every 30 seconds (without interfering with user input)
  useEffect(() => {
    if (!executionState) return;

    const intervalId = setInterval(() => {
      const currentDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      updateIncompleteSessionProgress({ duration: currentDuration });
    }, 30000);

    return () => clearInterval(intervalId);
  }, [executionState, updateIncompleteSessionProgress]);

  // Track completed sets count to detect when user marks a set as done
  const completedSetsCountRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!executionState) return;
    if (Object.keys(exerciseStates).length === 0) return;

    // Count total completed sets
    let totalCompleted = 0;
    Object.values(exerciseStates).forEach((state) => {
      totalCompleted += state.sets.filter(s => s.isDone).length;
    });

    // On first run, just initialize the ref without saving
    if (!isInitializedRef.current) {
      completedSetsCountRef.current = totalCompleted;
      isInitializedRef.current = true;
      return; // NO guardar en la primera inicialización
    }

    // Only save when completed sets count changes (user marked/unmarked a set)
    if (totalCompleted !== completedSetsCountRef.current) {
      console.log('[useRoutineExecution] 💾 Guardando progreso:', totalCompleted, 'sets completados');

      const currentDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);

      updateIncompleteSessionProgress({
        duration: currentDuration,
        exerciseStates,
        expandedExercises,
      });

      completedSetsCountRef.current = totalCompleted;
    }
  }, [exerciseStates, expandedExercises, updateIncompleteSessionProgress, executionState]);

  // Rest timer countdown
  useEffect(() => {
    if (timerState === 'running' && restSeconds > 0) {
      const timer = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            setTimerState('idle');
            setCurrentTimerExerciseId(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timerState, restSeconds]);

  // Map RoutineExercise[] to Exercise[] for UI compatibility
  const exercises = useMemo(() => {
    if (!currentRoutine?.exercises) return [];

    return currentRoutine.exercises.map((routineExercise): Exercise => ({
      id: routineExercise.id_exercise.toString(),
      name: routineExercise.exercise_name,
      sets: routineExercise.series || 3,
      reps: (routineExercise.reps || 10).toString(),
      rest: 60, // Default rest time in seconds
      muscleGroups: [routineExercise.muscular_group],
    }));
  }, [currentRoutine?.exercises]);

  /**
   * Toggle exercise expand/collapse
   */
  const toggleExerciseExpand = useCallback((exerciseId: string) => {
    setExpandedExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  }, []);

  /**
   * Update a specific set's data (weight, reps)
   */
  const updateSet = useCallback((exerciseId: string, setIndex: number, data: Partial<SetExecution>) => {
    setExerciseStates((prev) => {
      const exerciseState = prev[exerciseId];
      if (!exerciseState) return prev;

      const updatedSets = [...exerciseState.sets];
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        ...data,
      };

      return {
        ...prev,
        [exerciseId]: {
          ...exerciseState,
          sets: updatedSets,
        },
      };
    });
  }, []);

  /**
   * Add a new set to an exercise
   */
  const addSet = useCallback((exerciseId: string) => {
    setExerciseStates((prev) => {
      const exerciseState = prev[exerciseId];
      if (!exerciseState) return prev;

      // Get default reps from the exercise or from the last set
      const exercise = exercises.find((e) => e.id === exerciseId);
      const lastSet = exerciseState.sets[exerciseState.sets.length - 1];
      const defaultReps = exercise?.reps ? parseInt(exercise.reps, 10) : lastSet?.currentReps || 10;
      const newSetNumber = exerciseState.sets.length + 1;

      return {
        ...prev,
        [exerciseId]: {
          ...exerciseState,
          sets: [
            ...exerciseState.sets,
            {
              setNumber: newSetNumber,
              previousWeight: lastSet?.currentWeight || 0,
              previousReps: lastSet?.currentReps || defaultReps,
              currentWeight: 0,
              currentReps: defaultReps,
              isDone: false,
            },
          ],
        },
      };
    });
  }, [exercises]);

  /**
   * Mark a set as done and start rest timer
   */
  const markSetDone = useCallback(async (exerciseId: string, setIndex: number) => {
    const currentState = exerciseStates[exerciseId];
    if (!currentState) {
      console.error('[markSetDone] ❌ Estado del ejercicio no encontrado');
      return;
    }

    const setData = currentState.sets[setIndex];
    const currentDoneStatus = setData.isDone;
    const newDoneStatus = !currentDoneStatus;

    // If marking as done, save to backend
    if (!currentDoneStatus && executionState?.workoutSessionId) {
      try {
        const exercise = exercises.find((e) => e.id === exerciseId);
        const restSeconds = exercise?.rest || 60;

        await workoutRepository.registerSet(executionState.workoutSessionId, {
          id_exercise: parseInt(exerciseId, 10),
          set_number: setData.setNumber,
          weight: setData.currentWeight,
          reps: setData.currentReps,
          rest_seconds: restSeconds,
        });
      } catch (error: any) {
        console.error('[markSetDone] ❌ Error guardando en backend:', error?.message);
      }
    }

    // Update local state
    setExerciseStates((prev) => {
      const exerciseState = prev[exerciseId];
      if (!exerciseState) return prev;

      const updatedSets = [...exerciseState.sets];
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        isDone: newDoneStatus,
      };

      // If marking as done, start rest timer
      if (newDoneStatus) {
        const exercise = exercises.find((e) => e.id === exerciseId);
        const restTime = exercise?.rest || 60;

        setTimerState('running');
        setCurrentTimerExerciseId(exerciseId);
        setRestSeconds(restTime);
      }

      return {
        ...prev,
        [exerciseId]: {
          ...exerciseState,
          sets: updatedSets,
        },
      };
    });
  }, [exercises, exerciseStates, executionState]);

  /**
   * Skip rest timer
   */
  const skipTimer = useCallback(() => {
    setTimerState('idle');
    setCurrentTimerExerciseId(null);
    setRestSeconds(0);
  }, []);

  /**
   * Add a new exercise to the workout
   * TODO: This needs to fetch the exercise details from the exercises catalog
   */
  const addExercise = useCallback((exerciseId: string) => {
    setExerciseStates((prev) => ({
      ...prev,
      [exerciseId]: {
        sets: Array.from({ length: 3 }, (_, index): SetExecution => ({
          setNumber: index + 1,
          previousWeight: 0,
          previousReps: 10,
          currentWeight: 0,
          currentReps: 10,
          isDone: false,
        })),
      },
    }));

    setExpandedExercises((prev) => ({
      ...prev,
      [exerciseId]: true,
    }));
  }, []);

  /**
   * Calculate total volume (weight × reps for all completed sets)
   */
  const calculateTotalVolume = useCallback(() => {
    let volume = 0;
    Object.values(exerciseStates).forEach((exerciseState) => {
      exerciseState.sets.forEach((set) => {
        if (set.isDone) {
          volume += set.currentWeight * set.currentReps;
        }
      });
    });
    return volume;
  }, [exerciseStates]);

  /**
   * Calculate total completed sets
   */
  const calculateSetsCompleted = useCallback(() => {
    let completed = 0;
    Object.values(exerciseStates).forEach((exerciseState) => {
      exerciseState.sets.forEach((set) => {
        if (set.isDone) {
          completed++;
        }
      });
    });
    return completed;
  }, [exerciseStates]);

  /**
   * Calculate total sets across all exercises
   */
  const calculateTotalSets = useCallback(() => {
    let total = 0;
    Object.values(exerciseStates).forEach((exerciseState) => {
      total += exerciseState.sets.length;
    });
    return total;
  }, [exerciseStates]);

  /**
   * Complete the routine and return statistics
   * Note: This does NOT save the session - that happens when user confirms on RoutineCompletedScreen
   */
  const completeRoutine = useCallback(() => {
    if (!executionState?.workoutSessionId) {
      console.error('[completeRoutine] ❌ No hay sesión activa');
      throw new Error('No active workout session found');
    }

    const totalVolume = calculateTotalVolume();
    const setsCompleted = calculateSetsCompleted();
    const totalSets = calculateTotalSets();

    console.log('[completeRoutine] ✅ Rutina completada -', setsCompleted, 'sets,', totalVolume, 'kg');

    return {
      workoutSessionId: executionState.workoutSessionId,
      routineId,
      routineName: currentRoutine?.routine_name || '',
      duration,
      totalVolume,
      setsCompleted,
      totalSets,
    };
  }, [executionState, routineId, currentRoutine, duration, calculateTotalVolume, calculateSetsCompleted, calculateTotalSets]);

  /**
   * Discard the routine without saving
   */
  const discardRoutine = useCallback(() => {
    console.log('[discardRoutine] 🗑️ Descartando rutina');
    storeDiscardSession();
  }, [storeDiscardSession]);

  // Calculate derived values
  const totalVolume = calculateTotalVolume();
  const setsCompleted = calculateSetsCompleted();
  const totalSets = calculateTotalSets();

  return {
    routineId,
    routineName: currentRoutine?.routine_name || '',
    exercises,
    exerciseStates,
    expandedExercises,
    timerState,
    currentTimerExerciseId,
    duration,
    totalVolume,
    setsCompleted,
    totalSets,
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
