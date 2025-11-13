/**
 * @deprecated Use RoutineExercise from Routine.ts instead
 * This interface is kept for temporary backward compatibility only.
 * Will be removed in future versions.
 */
export interface Exercise {
  id: string;
  name: string;
  sets: number | string;
  reps: string;
  rest: number; // segundos
  muscleGroups: string[];
}
