import type {
  AchievementDefinition,
  AchievementDefinitionInput,
  AchievementQueryParams,
  UpdateAchievementDefinitionInput
} from '../entities';

export interface AchievementRepository {
  /**
   * List achievement definitions. Admin endpoint supports filters.
   */
  getDefinitions(params?: AchievementQueryParams): Promise<AchievementDefinition[]>;
  createDefinition(payload: AchievementDefinitionInput): Promise<AchievementDefinition>;
  updateDefinition(payload: UpdateAchievementDefinitionInput): Promise<AchievementDefinition>;
  deleteDefinition(id: number): Promise<void>;
}
