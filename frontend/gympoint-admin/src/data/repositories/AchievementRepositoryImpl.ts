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
    const response = await apiClient.get<{ data: AchievementDefinitionResponse[] }>('/achievements/definitions', {
      params: {
        category: params?.category,
        includeInactive: params?.includeInactive ?? true,
      },
    });

    return response.data.data.map(mapAchievementDefinitionResponseToAchievementDefinition);
  }

  async createDefinition(payload: AchievementDefinitionInput): Promise<AchievementDefinition> {
    const request = mapCreateAchievementDefinitionToRequest(payload);
    const response = await apiClient.post<AchievementDefinitionResponse>('/achievements/definitions', request);
    return mapAchievementDefinitionResponseToAchievementDefinition(response.data);
  }

  async updateDefinition(payload: UpdateAchievementDefinitionInput): Promise<AchievementDefinition> {
    const request = mapUpdateAchievementDefinitionToRequest(payload);
    const response = await apiClient.put<AchievementDefinitionResponse>(
      `/achievements/definitions/${payload.id_achievement_definition}`,
      request
    );
    return mapAchievementDefinitionResponseToAchievementDefinition(response.data);
  }

  async deleteDefinition(id: number): Promise<void> {
    await apiClient.delete(`/achievements/definitions/${id}`);
  }
}

