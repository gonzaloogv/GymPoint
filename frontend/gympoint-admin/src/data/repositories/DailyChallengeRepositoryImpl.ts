import { apiClient } from '../api';
import {
  DailyChallengeRepository,
  DailyChallenge,
  DailyChallengeTemplate,
  DailyChallengeConfig,
  CreateDailyChallengeDTO,
  UpdateDailyChallengeDTO,
  CreateDailyChallengeTemplateDTO,
  UpdateDailyChallengeTemplateDTO
} from '@/domain';

export class DailyChallengeRepositoryImpl implements DailyChallengeRepository {
  async getChallenges(params?: { from?: string; to?: string; include_inactive?: boolean }): Promise<DailyChallenge[]> {
    const response = await apiClient.get<{ data: DailyChallenge[] }>('/admin/daily-challenges', { params });
    return response.data.data;
  }

  async getChallenge(id: number): Promise<DailyChallenge> {
    const response = await apiClient.get<{ data: DailyChallenge }>(`/admin/daily-challenges/${id}`);
    return response.data.data;
  }

  async createChallenge(payload: CreateDailyChallengeDTO): Promise<DailyChallenge> {
    const response = await apiClient.post<{ data: DailyChallenge }>('/admin/daily-challenges', payload);
    return response.data.data;
  }

  async updateChallenge(payload: UpdateDailyChallengeDTO): Promise<DailyChallenge> {
    const { id_challenge, ...data } = payload;
    const response = await apiClient.put<{ data: DailyChallenge }>(`/admin/daily-challenges/${id_challenge}`, data);
    return response.data.data;
  }

  async deleteChallenge(id: number): Promise<void> {
    await apiClient.delete(`/admin/daily-challenges/${id}`);
  }

  async getTemplates(): Promise<DailyChallengeTemplate[]> {
    const response = await apiClient.get<{ data: DailyChallengeTemplate[] }>('/admin/daily-challenges/templates');
    return response.data.data;
  }

  async createTemplate(payload: CreateDailyChallengeTemplateDTO): Promise<DailyChallengeTemplate> {
    const response = await apiClient.post<{ data: DailyChallengeTemplate }>('/admin/daily-challenges/templates', payload);
    return response.data.data;
  }

  async updateTemplate(payload: UpdateDailyChallengeTemplateDTO): Promise<DailyChallengeTemplate> {
    const { id_template, ...data } = payload;
    const response = await apiClient.put<{ data: DailyChallengeTemplate }>(`/admin/daily-challenges/templates/${id_template}`, data);
    return response.data.data;
  }

  async deleteTemplate(id: number): Promise<void> {
    await apiClient.delete(`/admin/daily-challenges/templates/${id}`);
  }

  async getConfig(): Promise<DailyChallengeConfig> {
    const response = await apiClient.get<{ data: DailyChallengeConfig }>('/admin/daily-challenges/config/settings');
    return response.data.data;
  }

  async updateConfig(payload: Partial<DailyChallengeConfig>): Promise<DailyChallengeConfig> {
    const response = await apiClient.put<{ data: DailyChallengeConfig }>('/admin/daily-challenges/config/settings', payload);
    return response.data.data;
  }

  async runRotation(): Promise<DailyChallenge | null> {
    const response = await apiClient.post<{ data: DailyChallenge | null }>('/admin/daily-challenges/actions/run');
    return response.data.data;
  }
}
