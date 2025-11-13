import { UserRepository } from '../repositories/UserRepository';
import { Frequency } from '../entities/Frequency';

export class UpdateWeeklyFrequency {
  constructor(private repository: UserRepository) {}

  async execute(goal: number): Promise<Frequency> {
    return this.repository.updateWeeklyFrequency(goal);
  }
}
