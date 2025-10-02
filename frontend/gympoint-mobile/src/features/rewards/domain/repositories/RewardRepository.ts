import { Reward } from '../entities/Reward';
import { GeneratedCode } from '../entities/GeneratedCode';

export interface RewardRepository {
  getAvailableRewards(isPremium: boolean): Promise<Reward[]>;
  generateCode(rewardId: string): Promise<GeneratedCode>;
  getGeneratedCodes(): Promise<GeneratedCode[]>;
}

