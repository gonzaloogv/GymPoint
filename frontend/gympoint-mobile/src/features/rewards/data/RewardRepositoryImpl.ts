import { RewardRepository, ListRewardsParams } from '../domain/repositories/RewardRepository';
import { Reward } from '../domain/entities/Reward';
import { GeneratedCode } from '../domain/entities/GeneratedCode';
import { RewardRemote } from './reward.remote';
import { RewardLocal } from './datasources/RewardLocal';
import {
  mapRewardDTOToEntity,
  mapGeneratedCodeDTOToEntity,
} from './mappers/reward.mapper';
import { mapRewardResponseDTOArrayToEntityArray } from './mappers/reward.api.mapper';

export class RewardRepositoryImpl implements RewardRepository {
  constructor(
    private remote: RewardRemote,
    private local: RewardLocal
  ) {}

  async listRewards(params?: ListRewardsParams): Promise<Reward[]> {
    try {
      const dtos = await this.remote.listRewards(params);
      return mapRewardResponseDTOArrayToEntityArray(dtos);
    } catch (error) {
      console.error('Error fetching rewards from API:', error);
      // Fallback to local mock data if API fails
      const dtos = await this.local.getAllRewards(false);
      return dtos.map(mapRewardDTOToEntity);
    }
  }

  async getRewardById(id: number): Promise<Reward | null> {
    try {
      const dto = await this.remote.getRewardById(id);
      const rewards = mapRewardResponseDTOArrayToEntityArray([dto]);
      return rewards[0] || null;
    } catch (error) {
      console.error(`Error fetching reward ${id} from API:`, error);
      return null;
    }
  }

  async getAvailableRewards(isPremium: boolean): Promise<Reward[]> {
    try {
      console.log('[RewardRepository] Fetching rewards from API...');

      // Get all active rewards from API
      const dtos = await this.remote.listRewards({ available: true });

      console.log(`[RewardRepository] Received ${dtos.length} rewards from API`);

      const rewards = mapRewardResponseDTOArrayToEntityArray(dtos);

      // Filter based on user plan
      const filtered = rewards.filter(reward => {
        // If reward category is premium, only show to premium users
        if (reward.category === 'premium' && !isPremium) {
          return false;
        }
        return reward.available;
      });

      console.log(`[RewardRepository] Returning ${filtered.length} rewards after filtering (isPremium: ${isPremium})`);

      return filtered;
    } catch (error) {
      console.error('[RewardRepository] Error fetching available rewards from API:', error);
      console.log('[RewardRepository] Falling back to local mock data');

      // Fallback to local mock data
      const dtos = await this.local.getAllRewards(isPremium);
      return dtos.map(mapRewardDTOToEntity);
    }
  }

  async getGeneratedCodes(): Promise<GeneratedCode[]> {
    // TODO: Implement API endpoint for generated codes
    // For now, use local mock data
    const dtos = await this.local.getInitialCodes();
    return dtos.map(mapGeneratedCodeDTOToEntity);
  }
}
