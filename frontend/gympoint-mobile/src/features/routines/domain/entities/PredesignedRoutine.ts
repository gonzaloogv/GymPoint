export type RoutineDifficulty = 'Principiante' | 'Intermedio' | 'Avanzado';
export type RoutineSource = 'template' | 'gym';

export interface PredesignedRoutine {
  id: string;
  name: string;
  difficulty: RoutineDifficulty;
  duration: number; // minutos
  exerciseCount: number;
  muscleGroups: string[];
  source: RoutineSource;
  imageUrl?: string;
}
