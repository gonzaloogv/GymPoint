import { useMemo, useState } from 'react';
import { Routine, RoutineStatus } from '../types';
import { mockRoutines } from '../mocks/routines.mock';

export function useRoutines() {
  const [loading] = useState(false);
  const [error] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<RoutineStatus | 'All'>('All');

  const list = useMemo(() => {
    const byStatus =
      status === 'All' ? mockRoutines : mockRoutines.filter((r) => r.status === status);
    const q = search.trim().toLowerCase();
    return q
      ? byStatus.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.muscleGroups.join(' ').toLowerCase().includes(q),
        )
      : byStatus;
  }, [search, status]);

  return { state: { list, loading, error, search, status }, setSearch, setStatus };
}
