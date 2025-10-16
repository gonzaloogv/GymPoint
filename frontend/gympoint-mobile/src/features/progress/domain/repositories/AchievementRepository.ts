import { Achievement } from '../entities/Progress';

export interface AchievementRepository {
  getAchievements(userId: string): Promise<Achievement[]>;
}
