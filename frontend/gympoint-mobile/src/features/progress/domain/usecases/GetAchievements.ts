import { AchievementRepository } from '../repositories';
import { Achievement } from '../entities/Progress';

export class GetAchievements {
  constructor(private repository: AchievementRepository) {}

  async execute(userId: string): Promise<Achievement[]> {
    return this.repository.getAchievements(userId);
  }
}
