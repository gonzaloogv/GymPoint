import { RewardRepository } from '../repositories/RewardRepository';
import { RewardInventoryItem } from '../entities/Reward';

export class GetRewardInventory {
  constructor(private repository: RewardRepository) {}

  async execute(): Promise<RewardInventoryItem[]> {
    return this.repository.getRewardInventory();
  }
}
