import { Achievement } from '../entities/Achievement';

export interface AchievementRepository {
  getMyAchievements(category?: string): Promise<Achievement[]>;
  syncMyAchievements(category?: string): Promise<void>;
  unlockAchievement(achievementId: string): Promise<Achievement>;
}
