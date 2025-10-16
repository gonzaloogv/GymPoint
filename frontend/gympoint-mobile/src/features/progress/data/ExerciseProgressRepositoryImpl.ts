import { ExerciseProgressRepository } from '../domain/repositories';
import { ExerciseProgressDetail } from '../domain/entities';
import { ExerciseProgressLocal } from './datasources';

export class ExerciseProgressRepositoryImpl implements ExerciseProgressRepository {
  constructor(private local: ExerciseProgressLocal) {}

  async getExerciseProgress(userId: string): Promise<ExerciseProgressDetail[]> {
    return this.local.getExerciseProgress(userId);
  }
}
