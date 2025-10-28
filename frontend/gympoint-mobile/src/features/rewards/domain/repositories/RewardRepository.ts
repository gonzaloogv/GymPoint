// src/features/rewards/domain/repositories/RewardRepository.ts

import { Reward } from '../entities/Reward';
import { GeneratedCode } from '../entities/GeneratedCode';

export interface ListRewardsParams {
  available?: boolean;
}

export interface RewardRepository {
  listRewards(params?: ListRewardsParams): Promise<Reward[]>;
  getRewardById(id: number): Promise<Reward | null>;
  getAvailableRewards(isPremium: boolean): Promise<Reward[]>;
  getGeneratedCodes(): Promise<GeneratedCode[]>;
}
