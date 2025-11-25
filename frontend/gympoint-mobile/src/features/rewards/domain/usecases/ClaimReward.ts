// src/features/rewards/domain/usecases/ClaimReward.ts

import { ClaimedReward } from '../entities/ClaimedReward';
import { RewardRepository, ClaimRewardParams } from '../repositories/RewardRepository';

export class ClaimReward {
  constructor(private repository: RewardRepository) {}

  async execute(rewardId: number, params: ClaimRewardParams): Promise<ClaimedReward> {
    return this.repository.claimReward(rewardId, params);
  }
}
