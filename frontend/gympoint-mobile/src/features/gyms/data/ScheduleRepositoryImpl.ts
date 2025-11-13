import { api } from '@shared/http/apiClient';
import type { Schedule } from '../domain/entities/Schedule';
import type { ScheduleRepository } from '../domain/repositories/ScheduleRepository';

export class ScheduleRepositoryImpl implements ScheduleRepository {
  // Cache simple en memoria para evitar repetir llamadas
  private cache = new Map<number, Schedule[]>();

  async getByGymId(id_gym: number): Promise<Schedule[]> {
    if (this.cache.has(id_gym)) return this.cache.get(id_gym)!;
    const res = await api.get(`/api/gyms/${id_gym}/schedules`);
    const arr: Schedule[] = Array.isArray(res.data) ? res.data : [];
    this.cache.set(id_gym, arr);
    return arr;
  }

  async getByGymIds(ids: number[]): Promise<Record<number, Schedule[]>> {
    const result: Record<number, Schedule[]> = {};
    const toFetch: number[] = [];

    for (const id of ids) {
      if (this.cache.has(id)) result[id] = this.cache.get(id)!;
      else toFetch.push(id);
    }
    // fan-out simple (si tu backend no soporta batch)
    await Promise.all(
      toFetch.map(async (id) => {
        try {
          const res = await api.get(`/api/gyms/${id}/schedules`);
          const arr: Schedule[] = Array.isArray(res.data) ? res.data : [];
          this.cache.set(id, arr);
          result[id] = arr;
        } catch {
          result[id] = [];
        }
      }),
    );

    // incluir los ya cacheados
    for (const id of ids) {
      if (!result[id] && this.cache.has(id)) result[id] = this.cache.get(id)!;
      if (!result[id]) result[id] = [];
    }

    return result;
  }
}
