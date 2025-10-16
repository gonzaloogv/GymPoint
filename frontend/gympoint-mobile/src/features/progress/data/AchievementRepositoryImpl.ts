import { AchievementRepository } from '../domain/repositories';
import { Achievement } from '../domain/entities/Progress';
import { AchievementLocal } from './datasources/AchievementLocal';

export class AchievementRepositoryImpl implements AchievementRepository {
  constructor(private local: AchievementLocal) {}

  async getAchievements(userId: string): Promise<Achievement[]> {
    return this.local.getAchievements(userId);
  }
}
