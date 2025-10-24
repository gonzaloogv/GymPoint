import {
  GymScheduleRepository,
  GymSchedule,
  CreateGymScheduleDTO,
  UpdateGymScheduleDTO,
  GymSpecialSchedule,
  CreateGymSpecialScheduleDTO,
} from '@/domain';
import { apiClient } from '../api';
import { GymScheduleResponse, GymSpecialScheduleResponse } from '../dto/types';
import {
  mapGymScheduleResponseToGymSchedule,
  mapCreateGymScheduleDTOToRequest,
  mapUpdateGymScheduleDTOToRequest,
  mapGymSpecialScheduleResponseToGymSpecialSchedule,
  mapCreateGymSpecialScheduleDTOToRequest,
} from '../mappers/GymScheduleMappers';

/**
 * Implementación del repositorio de Gym Schedules usando DTOs del OpenAPI
 */
export class GymScheduleRepositoryImpl implements GymScheduleRepository {
  /**
   * Obtener todos los horarios de un gimnasio
   */
  async getSchedulesByGym(id_gym: number): Promise<GymSchedule[]> {
    const response = await apiClient.get<GymScheduleResponse[]>(`/api/gym-schedules/${id_gym}`);
    return response.data.map(mapGymScheduleResponseToGymSchedule);
  }

  /**
   * Crear un nuevo horario
   */
  async createSchedule(schedule: CreateGymScheduleDTO): Promise<GymSchedule> {
    const request = mapCreateGymScheduleDTOToRequest(schedule);
    const response = await apiClient.post<GymScheduleResponse>('/api/gym-schedules', request);
    return mapGymScheduleResponseToGymSchedule(response.data);
  }

  /**
   * Actualizar un horario existente
   */
  async updateSchedule(schedule: UpdateGymScheduleDTO): Promise<GymSchedule> {
    const { id_schedule } = schedule;
    const request = mapUpdateGymScheduleDTOToRequest(schedule);
    const response = await apiClient.put<GymScheduleResponse>(
      `/api/gym-schedules/${id_schedule}`,
      request
    );
    return mapGymScheduleResponseToGymSchedule(response.data);
  }

  /**
   * Obtener todos los horarios especiales de un gimnasio
   */
  async getSpecialSchedulesByGym(id_gym: number): Promise<GymSpecialSchedule[]> {
    const response = await apiClient.get<GymSpecialScheduleResponse[]>(
      `/api/gym-special-schedules/${id_gym}`
    );
    return response.data.map(mapGymSpecialScheduleResponseToGymSpecialSchedule);
  }

  /**
   * Crear un nuevo horario especial
   */
  async createSpecialSchedule(schedule: CreateGymSpecialScheduleDTO): Promise<GymSpecialSchedule> {
    const request = mapCreateGymSpecialScheduleDTOToRequest(schedule);
    const response = await apiClient.post<GymSpecialScheduleResponse>(
      '/api/gym-special-schedules',
      request
    );
    return mapGymSpecialScheduleResponseToGymSpecialSchedule(response.data);
  }
}
