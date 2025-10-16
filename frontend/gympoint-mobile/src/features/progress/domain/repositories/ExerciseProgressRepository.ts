import { ExerciseProgressDetail } from '../entities/ExerciseProgressDetail';

export interface ExerciseProgressRepository {
  getExerciseProgress(userId: string): Promise<ExerciseProgressDetail[]>;
}
