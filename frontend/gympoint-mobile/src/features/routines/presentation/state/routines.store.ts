import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Routine, UserRoutine, RoutineSession, WorkoutSession } from '../../domain/entities';
import { routineRepository } from '../../data/RoutineRepositoryImpl';
import { userRoutineRepository } from '../../data/UserRoutineRepositoryImpl';
import { workoutRepository } from '../../data/WorkoutRepositoryImpl';
import { routinesLogger } from '@shared/services/logger';
import {
  saveIncompleteSession,
  getIncompleteSession,
  clearIncompleteSession,
  clearAllRoutineData,
  checkAndUpdateDBVersion
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

  // History
  history: RoutineSession[];
  loadingHistory: boolean;
  historyPage: number;
  historyHasMore: boolean;
  historyFilters: {
    startDate?: string;
    endDate?: string;
  };

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
  clearAllRoutineData: () => Promise<void>;
  checkDBVersionAndCleanup: () => Promise<boolean>;

  // History actions
  fetchRoutineHistory: (routineId: number, reset?: boolean) => Promise<void>;
  loadMoreHistory: (routineId: number) => Promise<void>;
  setHistoryDateFilter: (startDate?: string, endDate?: string) => void;

  // Routine management
  deleteRoutine: (id: number) => Promise<void>;

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
    historyPage: 1,
    historyHasMore: false,
    historyFilters: {},

    // Fetch user's routines
    fetchMyRoutines: async () => {
      set({ loading: true, error: null });
      try {
        // Check DB version and cleanup if needed (auto-detects DB resets)
        await get().checkDBVersionAndCleanup();

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
        // Check DB version and cleanup if needed (auto-detects DB resets)
        await get().checkDBVersionAndCleanup();

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
      } catch (error: any) {
        // 404 means no active routine assigned - this is valid
        if (error?.response?.status === 404) {
          routinesLogger.info('No active routine found - user has no assigned routine');
          set({ activeRoutine: null, loading: false });
        } else {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      }
    },

    // Start routine execution
    // SIMPLIFIED VERSION: Backend now auto-cleans orphaned sessions
    startExecution: async (routineId: number) => {
      try {
        routinesLogger.info('Starting execution for routine', { routineId });

        // 1. Check local incomplete session
        const existingIncompleteSession = get().incompleteSession;
        if (existingIncompleteSession && existingIncompleteSession.routineId !== routineId) {
          routinesLogger.warn('Pending session exists for different routine');
          throw new Error('PENDING_SESSION_EXISTS');
        }

        // 2. Check if resuming existing execution
        const existingExecution = get().executionState;
        if (existingExecution && existingExecution.routineId === routineId) {
          routinesLogger.info('Resuming existing execution');
          return; // Already started
        }

        // 3. Fetch routine details (needed for exercises)
        routinesLogger.debug('Fetching routine details');
        const routine = await get().fetchRoutineById(routineId);

        // 4. Ensure routine is assigned to user
        let activeRoutine = get().activeRoutine;
        if (!activeRoutine || activeRoutine.id_routine !== routineId) {
          routinesLogger.debug('Assigning routine to user');
          try {
            await userRoutineRepository.assignRoutine({
              id_routine: routineId,
              start_date: new Date().toISOString().split('T')[0],
            });
            await get().fetchActiveRoutine();
          } catch (error: any) {
            // Ignore "already has active routine" error
            if (!error?.response?.data?.error?.message?.includes('ya tiene una rutina activa')) {
              throw error;
            }
            routinesLogger.debug('User already has active routine, continuing');
          }
        }

        // 5. Check backend for active session
        // NOTE: Backend auto-cleans orphaned sessions (routine deleted)
        // So if we get a session back, it's guaranteed to be valid
        routinesLogger.debug('Checking for active workout session');
        let workoutSession = await workoutRepository.getActiveSession();

        if (workoutSession && workoutSession.id_routine !== routineId) {
          // Active session exists for different routine
          routinesLogger.warn('Active session exists for different routine', {
            activeRoutine: workoutSession.id_routine,
            requestedRoutine: routineId
          });
          throw new Error('ACTIVE_SESSION_EXISTS');
        }

        // 6. Create new session if needed
        if (!workoutSession) {
          routinesLogger.debug('Creating new workout session');
          workoutSession = await workoutRepository.startSession({
            id_routine: routineId,
            started_at: new Date().toISOString(),
          });
          routinesLogger.info('Workout session created', {
            sessionId: workoutSession.id_workout_session
          });
        } else {
          routinesLogger.info('Reusing existing workout session', {
            sessionId: workoutSession.id_workout_session
          });
        }

        // 7. Initialize execution state
        const executionState: ExecutionState = {
          routineId,
          workoutSessionId: workoutSession.id_workout_session,
          startedAt: workoutSession.started_at,
          currentExerciseIndex: 0,
          currentSet: 1,
          completedSets: [],
        };

        set({ executionState });
        routinesLogger.debug('Execution state created');

        // 8. Initialize exercise states for all exercises
        let initialExerciseStates: { [exerciseId: string]: ExerciseState } = {};
        let initialExpandedExercises: { [exerciseId: string]: boolean } = {};

        if (routine.exercises) {
          routinesLogger.debug('Initializing exercise states', {
            exerciseCount: routine.exercises.length
          });

          routine.exercises.forEach((exercise) => {
            const exerciseId = exercise.id_exercise.toString();
            const numSets = exercise.series || 3;
            const defaultReps = exercise.reps || 10;

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

            initialExpandedExercises[exerciseId] = false;
          });
        }

        // 9. Save as incomplete session
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

        await saveIncompleteSession(incompleteSession);
        set({ incompleteSession });
        routinesLogger.info('Execution started successfully');
      } catch (error: any) {
        // Log appropriately based on error type
        if (error.message === 'PENDING_SESSION_EXISTS' || error.message === 'ACTIVE_SESSION_EXISTS') {
          routinesLogger.warn('Cannot start execution', { reason: error.message });
        } else {
          routinesLogger.error('Failed to start execution', error);
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
        routinesLogger.info('Loading incomplete session...');

        // 1. Try to load from local AsyncStorage
        let session = await getIncompleteSession();

        // 2. Verify if the routine still exists (auto-cleanup orphaned sessions)
        if (session?.routineId) {
          try {
            await get().fetchRoutineById(session.routineId);
            // Routine exists, load the session
            routinesLogger.debug('Local incomplete session loaded', { routineId: session.routineId });
            set({ incompleteSession: session });
            return; // Successfully loaded from local storage
          } catch (error: any) {
            // If routine doesn't exist (404), clean up orphaned session
            if (error?.response?.status === 404 || error?.message?.includes('ROUTINE_NOT_FOUND')) {
              routinesLogger.info('Routine no longer exists, cleaning up orphaned local session');

              // Cancel backend session if exists
              if (session?.workoutSessionId) {
                try {
                  await workoutRepository.cancelSession(session.workoutSessionId);
                  routinesLogger.debug('Backend session cancelled');
                } catch (cancelError: any) {
                  // Silently ignore 404 errors (session already gone from backend)
                  if (cancelError?.response?.status === 404) {
                    routinesLogger.debug('Backend session already gone (404)');
                  } else {
                    routinesLogger.warn('Could not cancel backend session', cancelError);
                  }
                }
              }

              await clearIncompleteSession();
              set({ incompleteSession: null, executionState: null });
              session = null; // Clear for next step
            } else {
              // Other error, still load session but log warning
              routinesLogger.warn('Error verifying routine, loading session anyway', error);
              set({ incompleteSession: session });
              return;
            }
          }
        } else if (session) {
          // Session exists but has no routineId (shouldn't happen but handle it)
          set({ incompleteSession: session });
          return;
        }

        // 3. If no local session, check backend for active session
        routinesLogger.debug('No local session found, checking backend...');
        const backendSession = await workoutRepository.getActiveSession();

        if (backendSession && backendSession.id_routine) {
          routinesLogger.info('Backend active session found', {
            sessionId: backendSession.id_workout_session,
            routineId: backendSession.id_routine
          });

          // Fetch routine details to get the name
          try {
            const routine = await get().fetchRoutineById(backendSession.id_routine);

            // Create minimal incomplete session from backend data
            const minimalSession: IncompleteSession = {
              routineId: backendSession.id_routine,
              routineName: backendSession.routine?.routine_name || routine.routine_name,
              workoutSessionId: backendSession.id_workout_session,
              startedAt: backendSession.started_at,
              duration: 0, // Will be calculated when resuming
              currentExerciseIndex: 0,
              currentSet: 1,
              completedSets: [], // Backend has the authoritative set data
            };

            routinesLogger.info('Created minimal session from backend', { routineId: minimalSession.routineId });
            set({ incompleteSession: minimalSession });

            // Note: We don't save this to local storage yet - that happens when user resumes
          } catch (routineError: any) {
            // Routine doesn't exist but backend has session - orphaned session
            if (routineError?.response?.status === 404 || routineError?.message?.includes('ROUTINE_NOT_FOUND')) {
              routinesLogger.warn('Backend session is orphaned (routine deleted), backend will auto-cleanup');
              // Backend auto-cleanup will handle this on next API call
            } else {
              routinesLogger.error('Error fetching routine for backend session', routineError);
            }
          }
        } else {
          routinesLogger.debug('No incomplete session found (local or backend)');
          set({ incompleteSession: null });
        }
      } catch (error) {
        routinesLogger.error('Error loading incomplete session', error);
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

    // Clear all routine data from AsyncStorage
    clearAllRoutineData: async () => {
      try {
        console.log('[clearAllRoutineData] 🧹 Clearing all routine data from AsyncStorage...');

        await clearAllRoutineData();

        // Also clear state
        set({
          incompleteSession: null,
          executionState: null,
        });

        console.log('[clearAllRoutineData] ✅ All routine data cleared');
      } catch (error) {
        console.error('[clearAllRoutineData] ❌ Error clearing routine data:', error);
      }
    },

    // Check DB version and cleanup if needed
    checkDBVersionAndCleanup: async () => {
      try {
        console.log('[checkDBVersionAndCleanup] 🔍 Checking DB version...');

        // Fetch user's routines to use as DB fingerprint
        const routines = await routineRepository.getMyRoutines();

        if (routines.length === 0) {
          console.log('[checkDBVersionAndCleanup] ℹ️ No routines found, skipping version check');
          return false;
        }

        // Use the ID of the first routine + creation date as version fingerprint
        const firstRoutine = routines[0];
        const dbVersion = `${firstRoutine.id_routine}_${firstRoutine.created_at}`;

        const wasCleared = await checkAndUpdateDBVersion(dbVersion);

        if (wasCleared) {
          console.log('[checkDBVersionAndCleanup] ⚠️ DB was reset, AsyncStorage cleared');
          // Clear state as well
          set({
            incompleteSession: null,
            executionState: null,
          });
        }

        return wasCleared;
      } catch (error) {
        console.error('[checkDBVersionAndCleanup] ❌ Error checking DB version:', error);
        return false;
      }
    },

    // Fetch routine history (with pagination)
    fetchRoutineHistory: async (routineId: number, reset: boolean = true) => {
      set({ loadingHistory: true, error: null });

      try {
        const { historyPage, historyFilters } = get();
        const page = reset ? 1 : historyPage;
        const limit = 5;

        console.log('[fetchRoutineHistory] 📥 Fetching history for routine:', routineId, 'page:', page);

        // Get completed sessions with pagination
        const sessions = await workoutRepository.getMySessions({
          status: 'COMPLETED',
          id_routine: routineId,
          start_date: historyFilters.startDate,
          end_date: historyFilters.endDate,
          page,
          limit,
        });

        console.log('[fetchRoutineHistory] ✅ Fetched', sessions.length, 'sessions');

        // Map to RoutineSession format
        const routineSessions: RoutineSession[] = sessions.map((session) => ({
          id: session.id_workout_session.toString(),
          routineId: session.id_routine?.toString() || '',
          date: session.finished_at || session.started_at,
          durationMin: session.duration_seconds ? Math.round(session.duration_seconds / 60) : 0,
          completed: session.status === 'COMPLETED',
          notes: session.notes || undefined,
          logs: [], // Sets are not included in session list, would need separate fetch
        }));

        // If reset, replace history; otherwise, append
        const newHistory = reset ? routineSessions : [...get().history, ...routineSessions];
        const hasMore = sessions.length === limit;

        set({
          history: newHistory,
          loadingHistory: false,
          historyPage: page,
          historyHasMore: hasMore,
        });
      } catch (error) {
        console.error('[fetchRoutineHistory] ❌ Error fetching history:', error);
        set({ error: (error as Error).message, history: [], loadingHistory: false });
      }
    },

    // Load more history (pagination)
    loadMoreHistory: async (routineId: number) => {
      const { historyHasMore, loadingHistory, historyPage } = get();

      if (!historyHasMore || loadingHistory) {
        console.log('[loadMoreHistory] ⚠️ No more history to load or already loading');
        return;
      }

      console.log('[loadMoreHistory] 📥 Loading page', historyPage + 1);
      set({ historyPage: historyPage + 1 });
      await get().fetchRoutineHistory(routineId, false);
    },

    // Set date filter for history
    setHistoryDateFilter: (startDate?: string, endDate?: string) => {
      console.log('[setHistoryDateFilter] 📅 Setting date filter:', { startDate, endDate });
      set({
        historyFilters: { startDate, endDate },
        historyPage: 1,
      });
    },

    // Delete routine
    deleteRoutine: async (id: number) => {
      try {
        // 🔍 Check if there's an active workout session for this routine
        const activeSession = await workoutRepository.getActiveSession();

        if (activeSession && activeSession.id_routine === id) {
          console.log('[deleteRoutine] 🧹 Cancelling active workout session for this routine');
          try {
            await workoutRepository.cancelSession(activeSession.id_workout_session);
            console.log('[deleteRoutine] ✅ Workout session cancelled');
          } catch (cancelError) {
            console.error('[deleteRoutine] ⚠️ Error cancelling workout session:', cancelError);
            // Continue with deletion even if cancel fails
          }

          // Clear incomplete session if it matches
          const { incompleteSession } = get();
          if (incompleteSession?.routineId === id) {
            await clearIncompleteSession();
            set({ incompleteSession: null, executionState: null });
          }
        }

        // Delete the routine from backend
        await routineRepository.delete(id);

        // Remove from local state
        set((state) => {
          state.routines = state.routines.filter((r) => r.id_routine !== id);
        });

        // If it was the current routine, clear it
        const { currentRoutine } = get();
        if (currentRoutine?.id_routine === id) {
          set({ currentRoutine: null });
        }

        console.log('[deleteRoutine] ✅ Routine deleted successfully');
      } catch (error) {
        console.error('[deleteRoutine] ❌ Error deleting routine:', error);
        throw error;
      }
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
