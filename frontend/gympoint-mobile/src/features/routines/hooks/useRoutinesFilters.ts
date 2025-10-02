import { RoutineStatus } from '@features/routines/domain/entities';

export const FILTERS: Array<{ key: 'All' | RoutineStatus; label: string }> = [
  { key: 'All', label: 'Todas' },
  { key: 'Active', label: 'Activas' },
  { key: 'Scheduled', label: 'Programadas' },
  { key: 'Completed', label: 'Completadas' },
];
