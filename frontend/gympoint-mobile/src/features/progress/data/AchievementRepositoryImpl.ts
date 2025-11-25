import { AchievementRepository } from '../domain/repositories/AchievementRepository';
import { Achievement } from '../domain/entities/Achievement';
import { AchievementRemote } from './achievement.remote';
import { mapUserAchievementResponseDTOArrayToEntityArray } from './mappers/achievement.api.mapper';
import { logError, parseBackendError } from '@shared/utils/errorParser';

export class AchievementRepositoryImpl implements AchievementRepository {
  constructor(private remote: AchievementRemote) {}

  async getMyAchievements(category?: string): Promise<Achievement[]> {
    try {
      console.log('[AchievementRepository] Fetching achievements from API...');
      if (category) {
        console.log(`[AchievementRepository] Category filter: ${category}`);
      }
      const dtos = await this.remote.getMyAchievements(category);
      console.log(`[AchievementRepository] Received ${dtos.length} achievements`);
      return mapUserAchievementResponseDTOArrayToEntityArray(dtos);
    } catch (error) {
      logError('AchievementRepository.getMyAchievements', error);
      const errorMessage = parseBackendError(error);
      console.error(`[AchievementRepository] Error message: ${errorMessage}`);
      return [];
    }
  }

  async syncMyAchievements(category?: string): Promise<void> {
    try {
      console.log('[AchievementRepository] Syncing achievements...');
      if (category) {
        console.log(`[AchievementRepository] Sync category: ${category}`);
      }
      await this.remote.syncMyAchievements(category);
      console.log('[AchievementRepository] Synced successfully');
    } catch (error) {
      logError('AchievementRepository.syncMyAchievements', error);
      const errorMessage = parseBackendError(error);
      console.error(`[AchievementRepository] Sync error message: ${errorMessage}`);
      throw error;
    }
  }

  async unlockAchievement(achievementId: string): Promise<Achievement> {
    try {
      console.log(`[AchievementRepository] Unlocking achievement: ${achievementId}`);
      const dto = await this.remote.unlockAchievement(achievementId);
      const achievements = mapUserAchievementResponseDTOArrayToEntityArray([dto]);
      console.log('[AchievementRepository] Achievement unlocked successfully');
      return achievements[0];
    } catch (error) {
      logError('AchievementRepository.unlockAchievement', error);
      const errorMessage = parseBackendError(error);
      console.error(`[AchievementRepository] Unlock error: ${errorMessage}`);
      throw error;
    }
  }
}
