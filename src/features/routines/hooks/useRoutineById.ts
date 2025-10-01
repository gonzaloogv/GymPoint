import { useMemo } from 'react';
import { mockRoutines } from '../mocks/routines.mock';

export function useRoutineById(id?: string) {
  return useMemo(() => mockRoutines.find(r => r.id === id) ?? mockRoutines[0], [id]);
}
