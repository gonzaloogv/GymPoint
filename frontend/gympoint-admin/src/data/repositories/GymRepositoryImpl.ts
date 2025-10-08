import { GymRepository, Gym, CreateGymDTO, UpdateGymDTO } from '@/domain';
import { apiClient } from '../api';

export class GymRepositoryImpl implements GymRepository {
  async getAllGyms(): Promise<Gym[]> {
    const response = await apiClient.get<Gym[]>('/gyms');
    return response.data;
  }

  async getGymById(id: number): Promise<Gym> {
    const response = await apiClient.get<Gym>(`/gyms/${id}`);
    return response.data;
  }

  async createGym(gym: CreateGymDTO): Promise<Gym> {
    const response = await apiClient.post<Gym>('/gyms', gym);
    return response.data;
  }

  async updateGym(gym: UpdateGymDTO): Promise<Gym> {
    const { id_gym, ...data } = gym;
    const response = await apiClient.put<Gym>(`/gyms/${id_gym}`, data);
    return response.data;
  }

  async deleteGym(id: number): Promise<void> {
    await apiClient.delete(`/gyms/${id}`);
  }

  async getGymTypes(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/gyms/tipos');
    return response.data;
  }
}
