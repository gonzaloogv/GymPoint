import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Routine, UserRoutine, RoutineSession, WorkoutSession } from '../../domain/entities';
import { routineRepository } from '../../data/RoutineRepositoryImpl';
import { userRoutineRepository } from '../../data/UserRoutineRepositoryImpl';
import { workoutRepository } from '../../data/WorkoutRepositoryImpl';
import {
  saveIncompleteSession,
  getIncompleteSession,
  clearIncompleteSession
} from '../../data/datasources/incompleteSessionLocalDataSource';

// Execution state types
interface CompletedSet {
  exerciseId: number;
  setNumber: number;
  reps?: number;
  weight?: number;
  completedAt: string;
}

interface ExecutionState {
  routineId: number;
  workoutSessionId: number; // ID de la sesión en el backend
  startedAt: string;
  currentExerciseIndex: number;
  currentSet: number;
  completedSets: CompletedSet[];
}

interface SetExecution {
  setNumber: number;
  previousWeight: number;
  previousReps: number;
  currentWeight: number;
  currentReps: number;
  isDone: boolean;
}

interface ExerciseState {
  sets: SetExecution[];
}

interface IncompleteSession {
  routineId: number;
  routineName: string;
  workoutSessionId: number; // ID de la sesión en el backend
  startedAt: string;
  duration: number; // Duración en segundos
  currentExerciseIndex: number;
  currentSet: number;
  completedSets: CompletedSet[];
  // Estado completo de ejercicios con todos los checks
  exerciseStates?: { [exerciseId: string]: ExerciseState };
  expandedExercises?: { [exerciseId: string]: boolean };
}

interface RoutinesState {
  // Data from backend
  routines: Routine[];
  loading: boolean;
  error: string | null;

  // UI state (local)
  search: string;
  statusFilter: 'All' | 'Pending';

  // Routine detail
  currentRoutine: Routine | null;
  loadingRoutine: boolean;

  // Execution state (local + backend)
  activeRoutine: UserRoutine | null;
  executionState: ExecutionState | null;
  incompleteSession: IncompleteSession | null;

  // History (mock until backend implements)
  history: RoutineSession[];
  loadingHistory: boolean;

  // Actions - use repositories directly (no use cases)
  fetchMyRoutines: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  fetchRoutineById: (id: number) => Promise<Routine>;
  fetchActiveRoutine: () => Promise<void>;

  // Execution actions
  startExecution: (routineId: number) => Promise<void>;
  completeSet: (exerciseId: number, setNumber: number, data?: { reps?: number; weight?: number }) => void;
  saveSession: () => Promise<void>;
  discardSession: () => Promise<void>;
  forceCleanupOrphanedSession: () => Promise<void>;
  loadIncompleteSession: () => Promise<void>;
  resumeSession: () => void;
  updateIncompleteSessionProgress: (data: Partial<IncompleteSession>) => Promise<void>;

  // History actions (mock for now)
  fetchRoutineHistory: (routineId: number) => Promise<void>;

  // Filters
  setSearch: (search: string) => void;
  setStatusFilter: (status: 'All' | 'Pending') => void;

  // Computed
  getFilteredRoutines: () => Routine[];
}

export const useRoutinesStore = create<RoutinesState>()(
  immer((set, get) => ({
    // Initial state
    routines: [],
    loading: false,
    error: null,
    search: '',
    statusFilter: 'All' as 'All' | 'Pending',
    currentRoutine: null,
    loadingRoutine: false,
    activeRoutine: null,
    executionState: null,
    incompleteSession: null,
    history: [],
    loadingHistory: false,

    // Fetch user's routines
    fetchMyRoutines: async () => {
      set({ loading: true, error: null });
      try {
        const routines = await routineRepository.getMyRoutines();
        set({ routines, loading: false });
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
        throw error;
      }
    },

    // Fetch template routines
    fetchTemplates: async () => {
      set({ loading: true, error: null });
      try {
        const templates = await routineRepository.getTemplates();
        set({ routines: templates, loading: false });
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
        throw error;
      }
    },

    // Fetch routine by ID
    fetchRoutineById: async (id: number) => {
      set({ loadingRoutine: true, error: null });
      try {
        const routine = await routineRepository.getById(id);
        set({ currentRoutine: routine, loadingRoutine: false });
        return routine;
      } catch (error) {
        set({ error: (error as Error).message, loadingRoutine: false });
        throw error;
      }
    },

    // Fetch active routine
    fetchActiveRoutine: async () => {
      set({ loading: true, error: null });
      try {
        const activeRoutine = await userRoutineRepository.getActiveRoutine();
        set({ activeRoutine, loading: false });
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
        throw error;
      }
    },

    // Start routine execution
    startExecution: async (routineId: number) => {
      try {
        console.log('[startExecution] 🚀 Starting execution for routine:', routineId);

        // Check if there's an incomplete session for a different routine
        const existingIncompleteSession = get().incompleteSession;
        if (existingIncompleteSession && existingIncompleteSession.routineId !== routineId) {
          console.log('[startExecution] 🚫 Cannot start - pending session exists for different routine');
          throw new Error('PENDING_SESSION_EXISTS');
        }

        // Always fetch the routine (needed for exercise info)
        console.log('[startExecution] 📥 Fetching routine details from backend...');
        const routine = await get().fetchRoutineById(routineId);
        console.log('[startExecution] ✅ Routine fetched:', routine.routine_name);

        // Check if we're resuming an existing execution for this routine
        const existingExecution = get().executionState;
        if (existingExecution && existingExecution.routineId === routineId) {
          console.log('[startExecution] ♻️ Resuming existing execution - skipping session creation');
          // Routine is already loaded above, just return
          return;
        }

        // Check if user has active routine assignment
        let activeRoutine = get().activeRoutine;
        if (!activeRoutine) {
          console.log('[startExecution] ⚠️ No active routine in state, fetching...');
          await get().fetchActiveRoutine();
          activeRoutine = get().activeRoutine;
        }
        console.log('[startExecution] 📋 Active routine:', activeRoutine?.id_routine);

        // If no active routine or different routine, assign it
        if (!activeRoutine || activeRoutine.id_routine !== routineId) {
          console.log('[startExecution] 🔄 Need to assign routine');
          try {
            await userRoutineRepository.assignRoutine({
              id_routine: routineId,
              start_date: new Date().toISOString().split('T')[0],
            });
            await get().fetchActiveRoutine();
            console.log('[startExecution] ✅ Routine assigned successfully');
          } catch (error: any) {
            if (error?.response?.data?.error?.message?.includes('ya tiene una rutina activa')) {
              console.log('[startExecution] ⚠️ Usuario ya tiene una rutina activa, continuando...');
            } else {
              throw error;
            }
          }
        } else {
          console.log('[startExecution] ✅ Routine already assigned');
        }

        // Check if there's already an active workout session
        console.log('[startExecution] 🔍 Checking for active workout session...');
        let workoutSession = await workoutRepository.getActiveSession();

        if (workoutSession) {
          console.log('[startExecution] ⚠️ Found active workout session:', {
            id: workoutSession.id_workout_session,
            routine: workoutSession.id_routine,
            status: workoutSession.status,
          });

          // If active session is for a different routine, throw error
          if (workoutSession.id_routine !== routineId) {
            console.log('[startExecution] 🚫 Cannot start new session - active session exists for different routine');
            throw new Error('ACTIVE_SESSION_EXISTS');
          } else {
            console.log('[startExecution] ♻️ Active session is for same routine, reusing it');
          }
        } else {
          console.log('[startExecution] ✅ No active workout session found');
        }

        // Create new session if needed
        if (!workoutSession) {
          console.log('[startExecution] ➕ Creating new workout session...');
          workoutSession = await workoutRepository.startSession({
            id_routine: routineId,
            started_at: new Date().toISOString(),
          });
          console.log('[startExecution] ✅ Workout session created:', workoutSession.id_workout_session);
        }

        // Initialize execution state with workout session ID
        console.log('[startExecution] 📝 Creating execution state...');
        const executionState: ExecutionState = {
          routineId,
          workoutSessionId: workoutSession.id_workout_session,
          startedAt: workoutSession.started_at,
          currentExerciseIndex: 0,
          currentSet: 1,
          completedSets: [],
        };

        set({ executionState });
        console.log('[startExecution] ✅ Execution state set');

        // Initialize exercise states for all exercises (if routine has exercises)
        let initialExerciseStates: { [exerciseId: string]: ExerciseState } = {};
        let initialExpandedExercises: { [exerciseId: string]: boolean } = {};

        if (routine.exercises) {
          console.log('[startExecution] 🎯 Initializing exercise states for', routine.exercises.length, 'exercises');

          routine.exercises.forEach((exercise) => {
            const exerciseId = exercise.id_exercise.toString();
            const numSets = exercise.series || 3;
            const defaultReps = exercise.reps || 10;

            // Initialize sets for this exercise (all unchecked)
            initialExerciseStates[exerciseId] = {
              sets: Array.from({ length: numSets }, (_, index): SetExecution => ({
                setNumber: index + 1,
                previousWeight: 0,
                previousReps: defaultReps,
                currentWeight: 0,
                currentReps: defaultReps,
                isDone: false,
              })),
            };

            // All exercises start collapsed
            initialExpandedExercises[exerciseId] = false;
          });

          console.log('[startExecution] ✅ Exercise states initialized:', Object.keys(initialExerciseStates).length, 'exercises');
        }

        // Save as incomplete session (initial state with exercise states)
        const incompleteSession: IncompleteSession = {
          routineId,
          routineName: routine.routine_name,
          workoutSessionId: workoutSession.id_workout_session,
          startedAt: executionState.startedAt,
          duration: 0,
          currentExerciseIndex: 0,
          currentSet: 1,
          completedSets: [],
          exerciseStates: initialExerciseStates,
          expandedExercises: initialExpandedExercises,
        };

        console.log('[startExecution] 💾 Saving incomplete session to storage with exercise states...');
        await saveIncompleteSession(incompleteSession);
        set({ incompleteSession });
        console.log('[startExecution] 🎉 Execution started successfully!');
      } catch (error: any) {
        // Don't log expected business logic errors as errors
        if (error.message === 'PENDING_SESSION_EXISTS' || error.message === 'ACTIVE_SESSION_EXISTS') {
          console.log('[startExecution] ⚠️ Cannot start execution:', error.message);
        } else {
          console.error('[startExecution] ❌ Error starting execution:', error);
        }
        throw error;
      }
    },

    // Complete a set
    completeSet: (exerciseId: number, setNumber: number, data?: { reps?: number; weight?: number }) => {
      set((state) => {
        if (!state.executionState) return;

        const completedSet: CompletedSet = {
          exerciseId,
          setNumber,
          reps: data?.reps,
          weight: data?.weight,
          completedAt: new Date().toISOString(),
        };

        state.executionState.completedSets.push(completedSet);

        // Update incomplete session
        if (state.incompleteSession) {
          state.incompleteSession.completedSets = state.executionState.completedSets;
          state.incompleteSession.currentExerciseIndex = state.executionState.currentExerciseIndex;
          state.incompleteSession.currentSet = state.executionState.currentSet;

          // Save to localStorage
          saveIncompleteSession(state.incompleteSession).catch(console.error);
        }
      });
    },

    // Save session to backend
    saveSession: async () => {
      const { executionState, currentRoutine } = get();

      if (!executionState) {
        console.error('[saveSession] ❌ No execution state found');
        throw new Error('No active execution to save');
      }

      try {
        console.log('[saveSession] 💾 Saving session to backend...');
        console.log('[saveSession] 📊 Execution state:', executionState);

        // Complete the workout session in the backend
        await workoutRepository.completeSession(executionState.workoutSessionId, {
          ended_at: new Date().toISOString(),
          notes: undefined, // TODO: Add notes support
        });

        console.log('[saveSession] ✅ Session completed successfully');

        // Clear incomplete session from local storage
        await clearIncompleteSession();

        // Reset state
        set({
          executionState: null,
          incompleteSession: null,
        });

        console.log('[saveSession] 🎉 Session saved and state cleared');
      } catch (error) {
        console.error('[saveSession] ❌ Error saving session:', error);
        throw error;
      }
    },

    // Discard session
    discardSession: async () => {
      const { executionState } = get();

      // Cancel backend workout session if exists
      if (executionState?.workoutSessionId) {
        try {
          console.log('[discardSession] 🗑️ Cancelando sesión en backend:', executionState.workoutSessionId);
          await workoutRepository.cancelSession(executionState.workoutSessionId);
          console.log('[discardSession] ✅ Sesión cancelada en backend');
        } catch (error) {
          console.error('[discardSession] ❌ Error cancelando sesión en backend:', error);
          // Continue even if backend cancellation fails
        }
      }

      // Clear local storage and state
      await clearIncompleteSession();
      set({
        executionState: null,
        incompleteSession: null,
      });
      console.log('[discardSession] ✅ Sesión descartada completamente');
    },

    // Force cleanup orphaned session (when backend has active session but frontend doesn't)
    forceCleanupOrphanedSession: async () => {
      try {
        console.log('[forceCleanup] 🧹 Buscando sesión huérfana en backend...');

        // Get active session from backend
        const activeSession = await workoutRepository.getActiveSession();

        if (activeSession) {
          console.log('[forceCleanup] 🗑️ Cancelando sesión huérfana:', activeSession.id_workout_session);
          await workoutRepository.cancelSession(activeSession.id_workout_session);
          console.log('[forceCleanup] ✅ Sesión huérfana cancelada');
        } else {
          console.log('[forceCleanup] ℹ️ No hay sesión activa en backend');
        }

        // Clear local storage and state
        await clearIncompleteSession();
        set({
          executionState: null,
          incompleteSession: null,
        });

        console.log('[forceCleanup] ✅ Limpieza completa');
      } catch (error) {
        console.error('[forceCleanup] ❌ Error en limpieza forzada:', error);
        // Even if backend fails, clear frontend state
        await clearIncompleteSession();
        set({
          executionState: null,
          incompleteSession: null,
        });
      }
    },

    // Load incomplete session
    loadIncompleteSession: async () => {
      try {
        const session = await getIncompleteSession();
        set({ incompleteSession: session });
      } catch (error) {
        console.error('Error loading incomplete session:', error);
      }
    },

    // Resume incomplete session
    resumeSession: () => {
      const { incompleteSession } = get();

      if (!incompleteSession) return;

      const executionState: ExecutionState = {
        routineId: incompleteSession.routineId,
        workoutSessionId: incompleteSession.workoutSessionId,
        startedAt: incompleteSession.startedAt,
        currentExerciseIndex: incompleteSession.currentExerciseIndex,
        currentSet: incompleteSession.currentSet,
        completedSets: incompleteSession.completedSets,
      };

      set({ executionState });
    },

    // Update incomplete session progress (called from useRoutineExecution)
    updateIncompleteSessionProgress: async (data: Partial<IncompleteSession>) => {
      const { incompleteSession } = get();

      if (!incompleteSession) {
        console.log('[updateIncompleteSessionProgress] ⚠️ No incomplete session to update');
        return;
      }

      const updated: IncompleteSession = {
        ...incompleteSession,
        ...data,
      };

      console.log('[updateIncompleteSessionProgress] 💾 Guardando en AsyncStorage:', {
        routineId: updated.routineId,
        duration: updated.duration,
        hasExerciseStates: !!updated.exerciseStates,
        exerciseStatesKeys: updated.exerciseStates ? Object.keys(updated.exerciseStates) : [],
        firstExercise: updated.exerciseStates ? Object.values(updated.exerciseStates)[0]?.sets.filter(s => s.isDone).length : 0,
      });

      set({ incompleteSession: updated });
      await saveIncompleteSession(updated);

      console.log('[updateIncompleteSessionProgress] ✅ Guardado en AsyncStorage completado');
    },

    // Fetch routine history (mock for now)
    fetchRoutineHistory: async (routineId: number) => {
      set({ loadingHistory: true, error: null });

      // TODO: Implement when backend has sessions endpoint
      // For now, return empty array
      set({ history: [], loadingHistory: false });

      // Mock implementation:
      // const history = await routineHistoryMock.filter(s => s.routineId === routineId);
      // set({ history, loadingHistory: false });
    },

    // Filters
    setSearch: (search: string) => set({ search }),
    setStatusFilter: (status: 'All' | 'Pending') => set({ statusFilter: status }),

    // Computed - get filtered routines based on search and status
    getFilteredRoutines: () => {
      const { routines, search, statusFilter, incompleteSession } = get();

      // Filter by status
      let byStatus = routines;

      if (statusFilter === 'Pending') {
        // Only show routine with incomplete session
        if (incompleteSession) {
          byStatus = routines.filter(r => r.id_routine === incompleteSession.routineId);
        } else {
          byStatus = []; // No pending routine
        }
      }
      // TODO: Filter other statuses when backend implements status
      // For now, 'All', 'Active', 'Scheduled', 'Completed' show all routines

      // Filter by search
      const q = search.trim().toLowerCase();
      if (!q) return byStatus;

      return byStatus.filter(
        (r) =>
          r.routine_name.toLowerCase().includes(q) ||
          (r.description?.toLowerCase().includes(q)) ||
          r.exercises?.some(ex =>
            ex.exercise_name.toLowerCase().includes(q) ||
            ex.muscular_group.toLowerCase().includes(q)
          )
      );
    },
  }))
);
