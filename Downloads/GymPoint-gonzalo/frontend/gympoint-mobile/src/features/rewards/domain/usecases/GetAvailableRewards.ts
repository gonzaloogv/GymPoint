import { RewardRepository } from '../repositories/RewardRepository';
import { Reward } from '../entities/Reward';

export class GetAvailableRewards {
  constructor(private repository: RewardRepository) {}

  async execute(isPremium: boolean): Promise<Reward[]> {
    return this.repository.getAvailableRewards(isPremium);
  }
}
