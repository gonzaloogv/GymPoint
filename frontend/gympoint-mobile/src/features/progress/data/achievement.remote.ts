import { apiClient } from '@shared/http/apiClient';
import { UserAchievementResponseDTO, AchievementsResponseWrapper } from './dto/achievement.api.dto';

export class AchievementRemote {
  async getMyAchievements(category?: string): Promise<UserAchievementResponseDTO[]> {
    let url = '/api/achievements/me';
    if (category) {
      url += '?category=' + category;
    }

    // La API devuelve { data: [...] }
    const response = await apiClient.get<AchievementsResponseWrapper>(url);
    return response.data.data || [];
  }

  async syncMyAchievements(category?: string): Promise<void> {
    const body = category ? { category } : {};
    await apiClient.post('/api/achievements/sync', body);
  }

  async unlockAchievement(achievementId: string): Promise<UserAchievementResponseDTO> {
    const response = await apiClient.post<{ message: string; data: UserAchievementResponseDTO }>(
      `/api/achievements/${achievementId}/unlock`
    );
    return response.data.data;
  }
}
