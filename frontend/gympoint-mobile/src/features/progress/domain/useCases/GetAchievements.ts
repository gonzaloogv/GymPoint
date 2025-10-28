import { AchievementRepository } from '../repositories/AchievementRepository';
import { Achievement } from '../entities/Achievement';

export class GetAchievements {
  constructor(private repository: AchievementRepository) {}

  async execute(category?: string): Promise<Achievement[]> {
    return this.repository.getMyAchievements(category);
  }
}
