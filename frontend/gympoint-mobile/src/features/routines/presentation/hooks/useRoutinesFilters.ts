import { RoutineStatus } from '@features/routines/domain/entities';

export const FILTERS: Array<{ key: 'All' | 'Pending'; label: string }> = [
  { key: 'All', label: 'Todas' },
  { key: 'Pending', label: 'Pendientes' },
];
