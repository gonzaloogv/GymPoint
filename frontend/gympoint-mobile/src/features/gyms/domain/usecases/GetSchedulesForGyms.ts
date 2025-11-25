import type { ScheduleRepository } from '../repositories/ScheduleRepository';

export class GetSchedulesForGyms {
  constructor(private repo: ScheduleRepository) {}
  async execute(ids: number[]) {
    return this.repo.getByGymIds(ids);
  }
}
