import {
  GymSpecialScheduleRepository,
  GymSpecialSchedule,
  CreateGymSpecialScheduleDTO,
  UpdateGymSpecialScheduleDTO,
} from '@/domain';
import { apiClient } from '../api';
import { GymSpecialScheduleResponse } from '../dto/types';
import {
  mapGymSpecialScheduleResponseToGymSpecialSchedule,
  mapCreateGymSpecialScheduleDTOToRequest,
  mapUpdateGymSpecialScheduleDTOToRequest,
} from '../mappers/GymScheduleMappers';

/**
 * Implementación del repositorio de Gym Special Schedules usando DTOs del OpenAPI
 */
export class GymSpecialScheduleRepositoryImpl implements GymSpecialScheduleRepository {
  /**
   * Obtener todos los horarios especiales de un gimnasio
   */
  async getSpecialSchedulesByGymId(id_gym: number): Promise<GymSpecialSchedule[]> {
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

  /**
   * Actualizar un horario especial existente
   */
  async updateSpecialSchedule(schedule: UpdateGymSpecialScheduleDTO): Promise<GymSpecialSchedule> {
    const { id_special_schedule } = schedule;
    const request = mapUpdateGymSpecialScheduleDTOToRequest(schedule);
    const response = await apiClient.put<GymSpecialScheduleResponse>(
      `/api/gym-special-schedules/${id_special_schedule}`,
      request
    );
    return mapGymSpecialScheduleResponseToGymSpecialSchedule(response.data);
  }

  /**
   * Eliminar un horario especial
   */
  async deleteSpecialSchedule(target: number | Pick<GymSpecialSchedule, 'id_special_schedule'>): Promise<void> {
    const id =
      typeof target === 'number'
        ? target
        : target?.id_special_schedule;

    if (id == null) {
      throw new Error('id_special_schedule es requerido para delete');
    }

    await apiClient.delete(`/api/gym-special-schedules/${id}`);
  }
}
