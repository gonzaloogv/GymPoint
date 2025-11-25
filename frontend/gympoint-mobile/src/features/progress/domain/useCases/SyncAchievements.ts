import { AchievementRepository } from '../repositories/AchievementRepository';

export class SyncAchievements {
  constructor(private repository: AchievementRepository) {}

  async execute(category?: string): Promise<void> {
    return this.repository.syncMyAchievements(category);
  }
}
