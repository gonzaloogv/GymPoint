import { RewardRepository } from '../repositories/RewardRepository';
import { GeneratedCode } from '../entities/GeneratedCode';

export class GetGeneratedCodes {
  constructor(private repository: RewardRepository) {}

  async execute(): Promise<GeneratedCode[]> {
    return this.repository.getGeneratedCodes();
  }
}
