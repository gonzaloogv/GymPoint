import { HomeRepository } from '../repositories/HomeRepository';
import { DailyChallenge } from '../entities/DailyChallenge';

export class GetDailyChallenge {
  constructor(private repository: HomeRepository) {}

  async execute(): Promise<DailyChallenge> {
    return this.repository.getDailyChallenge();
  }
}
