import { GymSpecialScheduleRepository, GymSpecialSchedule, CreateGymSpecialScheduleDTO, UpdateGymSpecialScheduleDTO } from '@/domain';
import { apiClient } from '../api';

export class GymSpecialScheduleRepositoryImpl implements GymSpecialScheduleRepository {
  async getSpecialSchedulesByGymId(id_gym: number): Promise<GymSpecialSchedule[]> {
    const response = await apiClient.get<GymSpecialSchedule[]>(`/gym-special-schedules/${id_gym}`);
    return response.data;
  }

  async createSpecialSchedule(schedule: CreateGymSpecialScheduleDTO): Promise<GymSpecialSchedule> {
    const response = await apiClient.post<GymSpecialSchedule>('/gym-special-schedules', schedule);
    return response.data;
  }

  async updateSpecialSchedule(schedule: UpdateGymSpecialScheduleDTO): Promise<GymSpecialSchedule> {
    const { id_special_schedule, ...data } = schedule;
    const response = await apiClient.put<GymSpecialSchedule>(`/gym-special-schedules/${id_special_schedule}`, data);
    return response.data;
  }

  async deleteSpecialSchedule(id: number): Promise<void> {
    await apiClient.delete(`/gym-special-schedules/${id}`);
  }
}


