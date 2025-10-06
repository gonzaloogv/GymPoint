import { RewardRepository } from '../domain/repositories/RewardRepository';
import { Reward } from '../domain/entities/Reward';
import { GeneratedCode } from '../domain/entities/GeneratedCode';
import { RewardLocal } from './datasources/RewardLocal';
import {
  mapRewardDTOToEntity,
  mapGeneratedCodeDTOToEntity,
} from './mappers/reward.mapper';

export class RewardRepositoryImpl implements RewardRepository {
  constructor(private local: RewardLocal) {}

  async getAvailableRewards(isPremium: boolean): Promise<Reward[]> {
    const dtos = await this.local.getAllRewards(isPremium);
    return dtos.map(mapRewardDTOToEntity);
  }

  async generateCode(rewardId: string): Promise<GeneratedCode> {
    // This will be implemented when we have the store logic
    throw new Error('Not implemented yet');
  }

  async getGeneratedCodes(): Promise<GeneratedCode[]> {
    const dtos = await this.local.getInitialCodes();
    return dtos.map(mapGeneratedCodeDTOToEntity);
  }
}
