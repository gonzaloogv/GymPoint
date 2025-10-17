import { GymScheduleRepository, GymSchedule, CreateGymScheduleDTO, UpdateGymScheduleDTO, GymSpecialSchedule, CreateGymSpecialScheduleDTO } from '@/domain';
import { apiClient } from '../api';

export class GymScheduleRepositoryImpl implements GymScheduleRepository {
  async getSchedulesByGym(id_gym: number): Promise<GymSchedule[]> {
    const response = await apiClient.get<GymSchedule[]>(`/schedules/${id_gym}`);
    return response.data;
  }

  async createSchedule(schedule: CreateGymScheduleDTO): Promise<GymSchedule> {
    const response = await apiClient.post<GymSchedule>('/schedules', schedule);
    return response.data;
  }

  async updateSchedule(schedule: UpdateGymScheduleDTO): Promise<GymSchedule> {
    const { id_schedule, ...data } = schedule;
    const response = await apiClient.put<GymSchedule>(`/schedules/${id_schedule}`, data);
    return response.data;
  }

  async getSpecialSchedulesByGym(id_gym: number): Promise<GymSpecialSchedule[]> {
    const response = await apiClient.get<GymSpecialSchedule[]>(`/special-schedules/${id_gym}`);
    return response.data;
  }

  async createSpecialSchedule(schedule: CreateGymSpecialScheduleDTO): Promise<GymSpecialSchedule> {
    const response = await apiClient.post<GymSpecialSchedule>('/special-schedules', schedule);
    return response.data;
  }
}




