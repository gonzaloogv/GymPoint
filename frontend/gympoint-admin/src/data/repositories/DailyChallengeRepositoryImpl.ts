import { DailyChallengeRepository, DailyChallenge, ChallengeStats } from '@/domain';
import { apiClient } from '../api';

export class DailyChallengeRepositoryImpl implements DailyChallengeRepository {
  async getAllChallenges(): Promise<DailyChallenge[]> {
    const response = await apiClient.get<{ message: string; data: DailyChallenge[] }>('/admin/challenges');
    return response.data.data;
  }

  async getChallengeStats(): Promise<ChallengeStats> {
    const response = await apiClient.get<{ message: string; data: ChallengeStats }>('/admin/challenges/stats');
    return response.data.data;
  }
}


