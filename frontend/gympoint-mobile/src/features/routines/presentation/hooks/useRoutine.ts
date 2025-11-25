import { useEffect } from 'react';
import { useRoutinesStore } from '../state';

export function useRoutines() {
  const {
    loading,
    error,
    search,
    statusFilter,
    setSearch,
    setStatusFilter,
    fetchMyRoutines,
    getFilteredRoutines,
  } = useRoutinesStore();

  // Fetch user's routines on mount
  useEffect(() => {
    fetchMyRoutines();
  }, [fetchMyRoutines]);

  const list = getFilteredRoutines();

  return {
    state: {
      list,
      loading,
      error: error ? true : false,
      search,
      status: statusFilter,
    },
    setSearch,
    setStatus: setStatusFilter,
  };
}
