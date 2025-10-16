import { Progress } from '../domain/entities/Progress';
import { ProgressRepository } from '../domain/repositories/ProgressRepository';
import { ProgressLocal } from './datasources/ProgressLocal';
import { progressMapper } from './mappers/progress.mapper';

export class ProgressRepositoryImpl implements ProgressRepository {
  constructor(private local: ProgressLocal) {}

  async getProgress(userId: string): Promise<Progress> {
    const dto = await this.local.getProgress(userId);
    return progressMapper.toDomain(dto);
  }
}
