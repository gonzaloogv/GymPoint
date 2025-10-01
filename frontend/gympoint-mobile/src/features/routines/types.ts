export type Exercise = {
  id: string;
  name: string;
  sets: number | string;
  reps: string;
  rest: number; // segundos
  muscleGroups: string[];
};

export type RoutineStatus = 'Active' | 'Scheduled' | 'Completed';

export type Routine = {
  id: string;
  name: string;
  status: RoutineStatus;
  exercises: Exercise[];
  estimatedDuration: number; // minutos
  lastPerformed?: string; // ISO
  nextScheduled?: string; // ISO
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  muscleGroups: string[];
};

/** --- NUEVO: historial/ejecución --- */
export type SetLog = {
  exerciseId: string;
  setNumber: number;
  reps?: number;
  weightKg?: number;
  restTakenSec?: number;
};

export type RoutineSession = {
  id: string;
  routineId: string;
  date: string; // ISO
  durationMin: number;
  completed: boolean;
  notes?: string;
  logs: SetLog[];
};
