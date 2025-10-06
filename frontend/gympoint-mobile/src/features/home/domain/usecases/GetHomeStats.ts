import { HomeRepository } from '../repositories/HomeRepository';
import { HomeStats } from '../entities/HomeStats';

export class GetHomeStats {
  constructor(private repository: HomeRepository) {}

  async execute(): Promise<HomeStats> {
    return this.repository.getHomeStats();
  }
}
