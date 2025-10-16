import { ExerciseProgressRepository } from '../repositories';
import { ExerciseProgressDetail } from '../entities';

export class GetExerciseProgress {
  constructor(private repository: ExerciseProgressRepository) {}

  async execute(userId: string): Promise<ExerciseProgressDetail[]> {
    return this.repository.getExerciseProgress(userId);
  }
}
