import { useEffect } from 'react';
import { useRoutinesStore } from '../state';

export function useRoutineById(id?: string) {
  const { currentRoutine, loadingRoutine, fetchRoutineById, routines } =
    useRoutinesStore();

  useEffect(() => {
    if (id) {
      fetchRoutineById(id);
    }
  }, [id, fetchRoutineById]);

  // Return current routine from store, or fallback to first routine if available
  return currentRoutine ?? routines[0] ?? null;
}
