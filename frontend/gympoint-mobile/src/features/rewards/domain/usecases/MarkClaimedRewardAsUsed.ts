// src/features/rewards/domain/usecases/MarkClaimedRewardAsUsed.ts

import { ClaimedReward } from '../entities/ClaimedReward';
import { RewardRepository } from '../repositories/RewardRepository';

export class MarkClaimedRewardAsUsed {
  constructor(private repository: RewardRepository) {}

  async execute(claimedRewardId: number): Promise<ClaimedReward> {
    return this.repository.markClaimedRewardAsUsed(claimedRewardId);
  }
}
