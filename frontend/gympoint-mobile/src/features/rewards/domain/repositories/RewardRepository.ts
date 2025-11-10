// src/features/rewards/domain/repositories/RewardRepository.ts

import { Reward } from '../entities/Reward';
import { GeneratedCode } from '../entities/GeneratedCode';
import { ClaimedReward } from '../entities/ClaimedReward';

export interface ListRewardsParams {
  available?: boolean;
}

export interface ListClaimedRewardsParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface ClaimRewardParams {
  tokensSpent: number;
  codeId?: number;
  expiresAt?: string;
}

export interface RewardRepository {
  listRewards(params?: ListRewardsParams): Promise<Reward[]>;
  getRewardById(id: number): Promise<Reward | null>;
  getAvailableRewards(isPremium: boolean): Promise<Reward[]>;
  getGeneratedCodes(): Promise<GeneratedCode[]>;

  // Claimed rewards methods
  claimReward(rewardId: number, params: ClaimRewardParams): Promise<ClaimedReward>;
  listClaimedRewards(userId: number, params?: ListClaimedRewardsParams): Promise<ClaimedReward[]>;
  getClaimedRewardById(claimedRewardId: number): Promise<ClaimedReward | null>;
  markClaimedRewardAsUsed(claimedRewardId: number): Promise<ClaimedReward>;
}
