// src/features/rewards/domain/usecases/GetClaimedRewards.ts

import { ClaimedReward } from '../entities/ClaimedReward';
import { RewardRepository, ListClaimedRewardsParams } from '../repositories/RewardRepository';

export class GetClaimedRewards {
  constructor(private repository: RewardRepository) {}

  async execute(userId: number, params?: ListClaimedRewardsParams): Promise<ClaimedReward[]> {
    return this.repository.listClaimedRewards(userId, params);
  }
}
