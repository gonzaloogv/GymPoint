import { Exercise } from './Exercise';

export type RoutineStatus = 'Active' | 'Scheduled' | 'Completed';

export interface Routine {
  id: string;
  name: string;
  status: RoutineStatus;
  exercises: Exercise[];
  estimatedDuration: number; // minutos
  lastPerformed?: string; // ISO
  nextScheduled?: string; // ISO
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  muscleGroups: string[];
}
