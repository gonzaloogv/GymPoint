import type { Schedule } from '../entities/Schedule';

export interface ScheduleRepository {
  getByGymId(id_gym: number): Promise<Schedule[]>;
  getByGymIds(ids: number[]): Promise<Record<number, Schedule[]>>; // map id_gym -> horarios
}
