export interface ExerciseDTO {
  id: string;
  name: string;
  sets: number | string;
  reps: string;
  rest: number;
  muscleGroups: string[];
}

export interface RoutineDTO {
  id: string;
  name: string;
  status: 'Active' | 'Scheduled' | 'Completed';
  exercises: ExerciseDTO[];
  estimatedDuration: number;
  lastPerformed?: string;
  nextScheduled?: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  muscleGroups: string[];
}

export interface SetLogDTO {
  exerciseId: string;
  setNumber: number;
  reps?: number;
  weightKg?: number;
  restTakenSec?: number;
}

export interface RoutineSessionDTO {
  id: string;
  routineId: string;
  date: string;
  durationMin: number;
  completed: boolean;
  notes?: string;
  logs: SetLogDTO[];
}
