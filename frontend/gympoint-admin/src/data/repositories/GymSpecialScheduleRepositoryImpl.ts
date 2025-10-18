import { GymSpecialScheduleRepository, GymSpecialSchedule, CreateGymSpecialScheduleDTO, UpdateGymSpecialScheduleDTO } from '@/domain';
import { apiClient } from '../api';

export class GymSpecialScheduleRepositoryImpl implements GymSpecialScheduleRepository {
  async getSpecialSchedulesByGymId(id_gym: number): Promise<GymSpecialSchedule[]> {
    const response = await apiClient.get<GymSpecialSchedule[]>(`/special-schedules/${id_gym}`);
    return response.data;
  }

  async createSpecialSchedule(schedule: CreateGymSpecialScheduleDTO): Promise<GymSpecialSchedule> {
    const response = await apiClient.post<GymSpecialSchedule>('/special-schedules', schedule);
    return response.data;
  }

  async updateSpecialSchedule(schedule: UpdateGymSpecialScheduleDTO): Promise<GymSpecialSchedule> {
    const { id_special_schedule, ...data } = schedule;
    const response = await apiClient.put<GymSpecialSchedule>(`/special-schedules/${id_special_schedule}`, data);
    return response.data;
  }

    async deleteSpecialSchedule(target: number | Pick<GymSpecialSchedule, 'id_special_schedule'>): Promise<void> {
    const id =
      typeof target === 'number'
        ? target
        : target?.id_special_schedule;

    if (id == null) {
      throw new Error('id_special_schedule es requerido para delete');
    }

    await apiClient.delete(`/special-schedules/${id}`);
  }
}


