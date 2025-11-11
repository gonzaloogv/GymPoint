import { RewardRepository } from '../repositories/RewardRepository';
import { ActiveEffectsSummary } from '../entities/Reward';

export class GetActiveRewardEffects {
  constructor(private repository: RewardRepository) {}

  async execute(): Promise<ActiveEffectsSummary> {
    return this.repository.getActiveEffects();
  }
}
