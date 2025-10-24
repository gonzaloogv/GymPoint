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
    const response = await apiClient.get<DailyChallengeResponse[]>('/admin/daily-challenges', { params });
    return response.data.map(mapDailyChallengeResponseToDailyChallenge);
  }

  async getChallenge(id: number): Promise<DailyChallenge> {
    const response = await apiClient.get<DailyChallengeResponse>(`/api/admin/daily-challenges/${id}`);
    return mapDailyChallengeResponseToDailyChallenge(response.data);
  }

  async createChallenge(payload: CreateDailyChallengeDTO): Promise<DailyChallenge> {
    const request = mapCreateDailyChallengeDTOToRequest(payload);
    const response = await apiClient.post<DailyChallengeResponse>('/admin/daily-challenges', request);
    return mapDailyChallengeResponseToDailyChallenge(response.data);
  }

  async updateChallenge(payload: UpdateDailyChallengeDTO): Promise<DailyChallenge> {
    const request = mapUpdateDailyChallengeDTOToRequest(payload);
    const response = await apiClient.put<DailyChallengeResponse>(`/api/admin/daily-challenges/${payload.id_challenge}`, request);
    return mapDailyChallengeResponseToDailyChallenge(response.data);
  }

  async deleteChallenge(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/daily-challenges/${id}`);
  }

  async getTemplates(): Promise<DailyChallengeTemplate[]> {
    const response = await apiClient.get<DailyChallengeTemplateResponse[]>('/admin/daily-challenges/templates');
    return response.data.map(mapDailyChallengeTemplateResponseToTemplate);
  }

  async createTemplate(payload: CreateDailyChallengeTemplateDTO): Promise<DailyChallengeTemplate> {
    const request = mapCreateDailyChallengeTemplateDTOToRequest(payload);
    const response = await apiClient.post<DailyChallengeTemplateResponse>('/admin/daily-challenges/templates', request);
    return mapDailyChallengeTemplateResponseToTemplate(response.data);
  }

  async updateTemplate(payload: UpdateDailyChallengeTemplateDTO): Promise<DailyChallengeTemplate> {
    const request = mapUpdateDailyChallengeTemplateDTOToRequest(payload);
    const response = await apiClient.put<DailyChallengeTemplateResponse>(`/api/admin/daily-challenges/templates/${payload.id_template}`, request);
    return mapDailyChallengeTemplateResponseToTemplate(response.data);
  }

  async deleteTemplate(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/daily-challenges/templates/${id}`);
  }

  async getConfig(): Promise<DailyChallengeConfig> {
    // TODO: Agregar DailyChallengeConfig al OpenAPI si es necesario
    const response = await apiClient.get<{ data: DailyChallengeConfig }>('/admin/daily-challenges/config/settings');
    return response.data.data;
  }

  async updateConfig(payload: Partial<DailyChallengeConfig>): Promise<DailyChallengeConfig> {
    // TODO: Agregar DailyChallengeConfig al OpenAPI si es necesario
    const response = await apiClient.put<{ data: DailyChallengeConfig }>('/admin/daily-challenges/config/settings', payload);
    return response.data.data;
  }

  async runRotation(): Promise<DailyChallenge | null> {
    // TODO: Agregar endpoint de rotation al OpenAPI si es necesario
    const response = await apiClient.post<{ data: DailyChallengeResponse | null }>('/admin/daily-challenges/actions/run');
    return response.data.data ? mapDailyChallengeResponseToDailyChallenge(response.data.data) : null;
  }
}
