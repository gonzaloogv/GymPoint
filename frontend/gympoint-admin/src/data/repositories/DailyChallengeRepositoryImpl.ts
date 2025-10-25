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
import {
  DailyChallengeResponse,
  DailyChallengeTemplateResponse,
} from '../dto/types';
import {
  mapDailyChallengeResponseToDailyChallenge,
  mapCreateDailyChallengeDTOToRequest,
  mapUpdateDailyChallengeDTOToRequest,
  mapDailyChallengeTemplateResponseToTemplate,
  mapCreateDailyChallengeTemplateDTOToRequest,
  mapUpdateDailyChallengeTemplateDTOToRequest,
} from '../mappers/CommonMappers';

export class DailyChallengeRepositoryImpl implements DailyChallengeRepository {
  async getChallenges(params?: { from?: string; to?: string; include_inactive?: boolean }): Promise<DailyChallenge[]> {
    const response = await apiClient.get<{ data: DailyChallengeResponse[] }>('/admin/daily-challenges', { params });
    return response.data.data.map(mapDailyChallengeResponseToDailyChallenge);
  }

  async getChallenge(id: number): Promise<DailyChallenge> {
    const response = await apiClient.get<{ data: DailyChallengeResponse }>(`/admin/daily-challenges/${id}`);
    return mapDailyChallengeResponseToDailyChallenge(response.data.data);
  }

  async createChallenge(payload: CreateDailyChallengeDTO): Promise<DailyChallenge> {
    const request = mapCreateDailyChallengeDTOToRequest(payload);
    const response = await apiClient.post<{ data: DailyChallengeResponse }>('/admin/daily-challenges', request);
    return mapDailyChallengeResponseToDailyChallenge(response.data.data);
  }

  async updateChallenge(payload: UpdateDailyChallengeDTO): Promise<DailyChallenge> {
    const request = mapUpdateDailyChallengeDTOToRequest(payload);
    const response = await apiClient.put<{ data: DailyChallengeResponse }>(`/admin/daily-challenges/${payload.id_challenge}`, request);
    return mapDailyChallengeResponseToDailyChallenge(response.data.data);
  }

  async deleteChallenge(id: number): Promise<void> {
    await apiClient.delete(`/admin/daily-challenges/${id}`);
  }

  async getTemplates(): Promise<DailyChallengeTemplate[]> {
    const response = await apiClient.get<{ data: DailyChallengeTemplateResponse[] }>('/admin/daily-challenges/templates');
    return response.data.data.map(mapDailyChallengeTemplateResponseToTemplate);
  }

  async createTemplate(payload: CreateDailyChallengeTemplateDTO): Promise<DailyChallengeTemplate> {
    const request = mapCreateDailyChallengeTemplateDTOToRequest(payload);
    const response = await apiClient.post<{ data: DailyChallengeTemplateResponse }>('/admin/daily-challenges/templates', request);
    return mapDailyChallengeTemplateResponseToTemplate(response.data.data);
  }

  async updateTemplate(payload: UpdateDailyChallengeTemplateDTO): Promise<DailyChallengeTemplate> {
    const request = mapUpdateDailyChallengeTemplateDTOToRequest(payload);
    const response = await apiClient.put<{ data: DailyChallengeTemplateResponse }>(`/admin/daily-challenges/templates/${payload.id_template}`, request);
    return mapDailyChallengeTemplateResponseToTemplate(response.data.data);
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
    const response = await apiClient.post<{ data: DailyChallengeResponse | null }>('/admin/daily-challenges/actions/run');
    return response.data.data ? mapDailyChallengeResponseToDailyChallenge(response.data.data) : null;
  }
}
