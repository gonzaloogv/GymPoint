import {
  RewardRepository,
  ListRewardsParams,
  ListClaimedRewardsParams,
  ClaimRewardParams,
} from '../domain/repositories/RewardRepository';
import { Reward } from '../domain/entities/Reward';
import { GeneratedCode } from '../domain/entities/GeneratedCode';
import { ClaimedReward } from '../domain/entities/ClaimedReward';
import { RewardRemote } from './reward.remote';
import { RewardLocal } from './datasources/RewardLocal';
import {
  mapRewardDTOToEntity,
  mapGeneratedCodeDTOToEntity,
} from './mappers/reward.mapper';
import { mapRewardResponseDTOArrayToEntityArray } from './mappers/reward.api.mapper';
import {
  mapClaimedRewardResponseDTOToEntity,
  mapClaimedRewardResponseDTOArrayToEntityArray,
} from './mappers/claimed-reward.api.mapper';

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
      // Get all active rewards from API
      const dtos = await this.remote.listRewards({ available: true });
      const rewards = mapRewardResponseDTOArrayToEntityArray(dtos);

      // Filter based on user plan
      const filtered = rewards.filter(reward => {
        // If reward category is premium, only show to premium users
        if (reward.category === 'premium' && !isPremium) {
          return false;
        }
        return reward.available;
      });

      return filtered;
    } catch (error) {
      console.error('[RewardRepository] Error fetching available rewards from API:', error);

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

  async claimReward(rewardId: number, params: ClaimRewardParams): Promise<ClaimedReward> {
    try {
      const dto = await this.remote.claimReward(rewardId, {
        tokens_spent: params.tokensSpent,
        code_id: params.codeId,
        expires_at: params.expiresAt,
      });
      return mapClaimedRewardResponseDTOToEntity(dto);
    } catch (error) {
      console.error(`[RewardRepository] Error claiming reward ${rewardId}:`, error);
      throw error;
    }
  }

  async listClaimedRewards(userId: number, params?: ListClaimedRewardsParams): Promise<ClaimedReward[]> {
    try {
      const dtos = await this.remote.listClaimedRewards(userId, params);
      return mapClaimedRewardResponseDTOArrayToEntityArray(dtos);
    } catch (error) {
      console.error(`[RewardRepository] Error fetching claimed rewards for user ${userId}:`, error);
      throw error;
    }
  }

  async getClaimedRewardById(claimedRewardId: number): Promise<ClaimedReward | null> {
    try {
      const dto = await this.remote.getClaimedRewardById(claimedRewardId);
      return mapClaimedRewardResponseDTOToEntity(dto);
    } catch (error) {
      console.error(`[RewardRepository] Error fetching claimed reward ${claimedRewardId}:`, error);
      return null;
    }
  }

  async markClaimedRewardAsUsed(claimedRewardId: number): Promise<ClaimedReward> {
    try {
      const dto = await this.remote.markClaimedRewardAsUsed(claimedRewardId);
      return mapClaimedRewardResponseDTOToEntity(dto);
    } catch (error) {
      console.error(`[RewardRepository] Error marking claimed reward ${claimedRewardId} as used:`, error);
      throw error;
    }
  }
}
