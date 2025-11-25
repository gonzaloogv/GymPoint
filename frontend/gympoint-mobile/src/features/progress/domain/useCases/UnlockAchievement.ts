import { AchievementRepository } from '../repositories/AchievementRepository';
import { Achievement } from '../entities/Achievement';

export class UnlockAchievement {
  constructor(private repository: AchievementRepository) {}

  async execute(achievementId: string): Promise<Achievement> {
    return this.repository.unlockAchievement(achievementId);
  }
}
