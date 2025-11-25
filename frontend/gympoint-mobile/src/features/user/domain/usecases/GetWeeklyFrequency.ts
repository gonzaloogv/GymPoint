import { UserRepository } from '../repositories/UserRepository';
import { Frequency } from '../entities/Frequency';

export class GetWeeklyFrequency {
  constructor(private repository: UserRepository) {}

  async execute(): Promise<Frequency> {
    return this.repository.getWeeklyFrequency();
  }
}
