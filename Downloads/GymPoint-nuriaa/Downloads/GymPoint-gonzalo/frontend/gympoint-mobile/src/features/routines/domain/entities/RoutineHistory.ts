export interface SetLog {
  exerciseId: string;
  setNumber: number;
  reps?: number;
  weightKg?: number;
  restTakenSec?: number;
}

export interface RoutineSession {
  id: string;
  routineId: string;
  date: string; // ISO
  durationMin: number;
  completed: boolean;
  notes?: string;
  logs: SetLog[];
}
