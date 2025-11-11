import { RewardRepository } from '../repositories/RewardRepository';
import { Reward } from '../entities/Reward';

export class GetAvailableRewards {
  constructor(private repository: RewardRepository) {}

  async execute(): Promise<Reward[]> {
    return this.repository.getAvailableRewards();
  }
}
