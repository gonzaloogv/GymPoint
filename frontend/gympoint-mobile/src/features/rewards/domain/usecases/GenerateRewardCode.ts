import { RewardRepository } from '../repositories/RewardRepository';
import { GeneratedCode } from '../entities/GeneratedCode';

export class GenerateRewardCode {
  constructor(private repository: RewardRepository) {}

  async execute(rewardId: string): Promise<GeneratedCode> {
    return this.repository.generateCode(rewardId);
  }
}

