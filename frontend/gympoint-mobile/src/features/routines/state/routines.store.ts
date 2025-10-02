import { create } from 'zustand';
import { DI } from '@di/container';
import { Routine, RoutineStatus, RoutineSession } from '../domain/entities';

interface RoutinesState {
  // State
  routines: Routine[];
  loading: boolean;
  error: string | null;
  search: string;
  status: RoutineStatus | 'All';
  
  // Routine detail
  currentRoutine: Routine | null;
  loadingRoutine: boolean;
  
  // History
  history: RoutineSession[];
  loadingHistory: boolean;

  // Actions
  fetchRoutines: () => Promise<void>;
  fetchRoutineById: (id: string) => Promise<void>;
  fetchRoutineHistory: (routineId: string) => Promise<void>;
  saveRoutineSession: (session: RoutineSession) => Promise<void>;
  
  // Filters
  setSearch: (search: string) => void;
  setStatus: (status: RoutineStatus | 'All') => void;
  
  // Computed
  getFilteredRoutines: () => Routine[];
}

export const useRoutinesStore = create<RoutinesState>((set, get) => ({
  // Initial state
  routines: [],
  loading: false,
  error: null,
  search: '',
  status: 'All',
  currentRoutine: null,
  loadingRoutine: false,
  history: [],
  loadingHistory: false,

  // Fetch all routines
  fetchRoutines: async () => {
    set({ loading: true, error: null });
    try {
      const routines = await DI.getRoutines.execute();
      set({ routines, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  // Fetch routine by ID
  fetchRoutineById: async (id: string) => {
    set({ loadingRoutine: true, error: null });
    try {
      const routine = await DI.getRoutineById.execute(id);
      set({ currentRoutine: routine, loadingRoutine: false });
    } catch (error) {
      set({ error: (error as Error).message, loadingRoutine: false });
    }
  },

  // Fetch routine history
  fetchRoutineHistory: async (routineId: string) => {
    set({ loadingHistory: true, error: null });
    try {
      const history = await DI.getRoutineHistory.execute(routineId);
      set({ history, loadingHistory: false });
    } catch (error) {
      set({ error: (error as Error).message, loadingHistory: false });
    }
  },

  // Save routine session
  saveRoutineSession: async (session: RoutineSession) => {
    set({ loading: true, error: null });
    try {
      await DI.executeRoutine.execute(session);
      set({ loading: false });
      // Refresh history
      await get().fetchRoutineHistory(session.routineId);
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  // Filters
  setSearch: (search: string) => set({ search }),
  setStatus: (status: RoutineStatus | 'All') => set({ status }),

  // Computed - get filtered routines based on search and status
  getFilteredRoutines: () => {
    const { routines, search, status } = get();
    
    // Filter by status
    const byStatus = status === 'All' 
      ? routines 
      : routines.filter((r) => r.status === status);
    
    // Filter by search
    const q = search.trim().toLowerCase();
    if (!q) return byStatus;
    
    return byStatus.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      r.muscleGroups.join(' ').toLowerCase().includes(q)
    );
  },
}));

