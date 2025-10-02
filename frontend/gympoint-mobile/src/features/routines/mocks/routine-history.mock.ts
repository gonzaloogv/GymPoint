import { RoutineSession } from '@features/routines/domain/entities';

export const mockRoutineHistory: RoutineSession[] = [
  {
    id: 'h1',
    routineId: '1',
    date: '2025-09-27T18:30:00Z',
    durationMin: 64,
    completed: true,
    logs: [
      { exerciseId: '1', setNumber: 1, reps: 10, weightKg: 60, restTakenSec: 110 },
      { exerciseId: '1', setNumber: 2, reps: 9, weightKg: 60, restTakenSec: 120 },
    ],
  },
  {
    id: 'h2',
    routineId: '1',
    date: '2025-09-22T19:00:00Z',
    durationMin: 62,
    completed: true,
    logs: [],
  },
  {
    id: 'h3',
    routineId: '2',
    date: '2025-09-20T17:10:00Z',
    durationMin: 55,
    completed: true,
    logs: [],
  },
];
