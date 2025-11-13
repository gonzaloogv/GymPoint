export type RoutineSource = 'template' | 'gym';

/**
 * Display labels for routine difficulty levels
 */
export const PREDESIGNED_DIFFICULTY_LABELS = {
  BEGINNER: 'Principiante',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
} as const;

export interface PredesignedRoutine {
  id: string;
  name: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number; // minutos
  exerciseCount: number;
  muscleGroups: string[];
  source: RoutineSource;
  imageUrl?: string;
}
