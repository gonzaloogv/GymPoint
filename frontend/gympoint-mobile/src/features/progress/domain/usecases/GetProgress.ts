import { Progress } from '../entities/Progress';
import { ProgressRepository } from '../repositories/ProgressRepository';

export class GetProgress {
  constructor(private repository: ProgressRepository) {}

  async execute(userId: string): Promise<Progress> {
    return this.repository.getProgress(userId);
  }
}
