import { StreakRepository, Streak, StreakStats, UserStreak } from '@/domain';
import { apiClient } from '../api';

export class StreakRepositoryImpl implements StreakRepository {
  async getAllStreaks(): Promise<Streak[]> {
    const response = await apiClient.get<{ message: string; data: Streak[] }>('/admin/streaks');
    return response.data.data;
  }

  async getUserStreak(id_user: number): Promise<UserStreak> {
    const response = await apiClient.get<{ message: string; data: UserStreak }>(`/admin/streaks/${id_user}`);
    return response.data.data;
  }

  async getStreakStats(): Promise<StreakStats> {
    const response = await apiClient.get<{ message: string; data: StreakStats }>('/admin/streaks/stats');
    return response.data.data;
  }
}


