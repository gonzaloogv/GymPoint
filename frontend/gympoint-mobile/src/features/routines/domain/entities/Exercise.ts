export interface Exercise {
  id: string;
  name: string;
  sets: number | string;
  reps: string;
  rest: number; // segundos
  muscleGroups: string[];
}
