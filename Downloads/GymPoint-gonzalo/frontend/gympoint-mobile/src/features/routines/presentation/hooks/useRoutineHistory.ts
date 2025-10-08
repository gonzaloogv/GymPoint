import { useEffect } from 'react';
import { useRoutinesStore } from '../state';

export function useRoutineHistory(routineId?: string) {
  const { history, loadingHistory, fetchRoutineHistory } = useRoutinesStore();

  useEffect(() => {
    if (routineId) {
      fetchRoutineHistory(routineId);
    }
  }, [routineId, fetchRoutineHistory]);

  // Sort by date descending
  const items = history.sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return { items, loading: loadingHistory };
}
