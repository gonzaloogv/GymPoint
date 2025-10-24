import type {
  AchievementDefinition,
  AchievementDefinitionInput,
  AchievementQueryParams,
  UpdateAchievementDefinitionInput
} from '@/domain';
import type { AchievementRepository } from '@/domain/repositories/AchievementRepository';
import { apiClient } from '../api';
import { AchievementDefinitionResponse } from '../dto/types';
import {
  mapAchievementDefinitionResponseToAchievementDefinition,
  mapCreateAchievementDefinitionToRequest,
  mapUpdateAchievementDefinitionToRequest,
} from '../mappers/CommonMappers';

export class AchievementRepositoryImpl implements AchievementRepository {
  async getDefinitions(params?: AchievementQueryParams): Promise<AchievementDefinition[]> {
    const response = await apiClient.get<AchievementDefinitionResponse[]>('/api/achievements/definitions', {
      params: {
        category: params?.category,
        includeInactive: params?.includeInactive ?? true,
      },
    });

    return response.data.map(mapAchievementDefinitionResponseToAchievementDefinition);
  }

  async createDefinition(payload: AchievementDefinitionInput): Promise<AchievementDefinition> {
    const request = mapCreateAchievementDefinitionToRequest(payload);
    const response = await apiClient.post<AchievementDefinitionResponse>('/api/achievements/definitions', request);
    return mapAchievementDefinitionResponseToAchievementDefinition(response.data);
  }

  async updateDefinition(payload: UpdateAchievementDefinitionInput): Promise<AchievementDefinition> {
    const { id_achievement_definition, ...domainData } = payload;
    const request = mapUpdateAchievementDefinitionToRequest(domainData);
    const response = await apiClient.put<AchievementDefinitionResponse>(
      `/api/achievements/definitions/${id_achievement_definition}`,
      request
    );
    return mapAchievementDefinitionResponseToAchievementDefinition(response.data);
  }

  async deleteDefinition(id: number): Promise<void> {
    await apiClient.delete(`/api/achievements/definitions/${id}`);
  }
}

