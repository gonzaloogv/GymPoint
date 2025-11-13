export interface SetLog {
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  previousReps?: number; // Para mostrar progreso vs sesión anterior
  previousWeightKg?: number; // Para mostrar progreso vs sesión anterior
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
