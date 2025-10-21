import type {
  AchievementDefinition,
  AchievementDefinitionInput,
  AchievementQueryParams,
  UpdateAchievementDefinitionInput
} from '@/domain';
import type { AchievementRepository } from '@/domain/repositories/AchievementRepository';
import { apiClient } from '../api';

interface AchievementDefinitionsResponse {
  data: AchievementDefinition[];
}

interface AchievementDefinitionResponse {
  message: string;
  data: AchievementDefinition;
}

export class AchievementRepositoryImpl implements AchievementRepository {
  async getDefinitions(params?: AchievementQueryParams): Promise<AchievementDefinition[]> {
    const response = await apiClient.get<AchievementDefinitionsResponse>('/achievements/definitions', {
      params: {
        category: params?.category,
        includeInactive: params?.includeInactive ?? true,
      },
    });

    return response.data.data;
  }

  async createDefinition(payload: AchievementDefinitionInput): Promise<AchievementDefinition> {
    const response = await apiClient.post<AchievementDefinitionResponse>('/achievements/definitions', payload);
    return response.data.data;
  }

  async updateDefinition(payload: UpdateAchievementDefinitionInput): Promise<AchievementDefinition> {
    const { id_achievement_definition, ...data } = payload;
    const response = await apiClient.put<AchievementDefinitionResponse>(
      `/achievements/definitions/${id_achievement_definition}`,
      data
    );
    return response.data.data;
  }

  async deleteDefinition(id: number): Promise<void> {
    await apiClient.delete(`/achievements/definitions/${id}`);
  }
}
