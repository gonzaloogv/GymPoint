import { useEffect } from 'react';
import { useRoutinesStore } from '../state';
import { RoutineStatus } from '@features/routines/domain/entities';

export function useRoutines() {
  const {
    loading,
    error,
    search,
    status,
    setSearch,
    setStatus,
    fetchRoutines,
    getFilteredRoutines,
  } = useRoutinesStore();

  // Fetch routines on mount
  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  const list = getFilteredRoutines();

  return {
    state: {
      list,
      loading,
      error: error ? true : false,
      search,
      status,
    },
    setSearch,
    setStatus: setStatus as (status: RoutineStatus | 'All') => void,
  };
}
