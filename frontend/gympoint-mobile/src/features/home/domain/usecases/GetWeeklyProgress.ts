import { HomeRepository } from '../repositories/HomeRepository';
import { WeeklyProgress } from '../entities/WeeklyProgress';

export class GetWeeklyProgress {
  constructor(private repository: HomeRepository) {}

  async execute(): Promise<WeeklyProgress> {
    return this.repository.getWeeklyProgress();
  }
}
