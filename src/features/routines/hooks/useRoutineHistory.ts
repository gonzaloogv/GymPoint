import { useMemo } from 'react';
import { mockRoutineHistory } from '../mocks/routine-history.mock';

export function useRoutineHistory(routineId?: string) {
  const items = useMemo(
    () => mockRoutineHistory
      .filter(h => !routineId || h.routineId === routineId)
      .sort((a,b) => +new Date(b.date) - +new Date(a.date)),
    [routineId]
  );
  return { items };
}
