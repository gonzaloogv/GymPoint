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
      `/gyms/${id_gym}/special-schedules`
    );
    return response.data.map(mapGymSpecialScheduleResponseToGymSpecialSchedule);
  }

  /**
   * Crear un nuevo horario especial
   */
  async createSpecialSchedule(schedule: CreateGymSpecialScheduleDTO): Promise<GymSpecialSchedule> {
    const request = mapCreateGymSpecialScheduleDTOToRequest(schedule);
    const response = await apiClient.post<GymSpecialScheduleResponse>(
      `/gyms/${schedule.id_gym}/special-schedules`,
      request
    );
    return mapGymSpecialScheduleResponseToGymSpecialSchedule(response.data);
  }

  /**
   * Actualizar un horario especial existente
   */
  async updateSpecialSchedule(schedule: UpdateGymSpecialScheduleDTO): Promise<GymSpecialSchedule> {
    const { id_special_schedule, id_gym } = schedule;
    const request = mapUpdateGymSpecialScheduleDTOToRequest(schedule);
    const response = await apiClient.patch<GymSpecialScheduleResponse>(
      `/gyms/${id_gym}/special-schedules/${id_special_schedule}`,
      request
    );
    return mapGymSpecialScheduleResponseToGymSpecialSchedule(response.data);
  }

  /**
   * Eliminar un horario especial
   */
  async deleteSpecialSchedule(target: number | Pick<GymSpecialSchedule, 'id_special_schedule' | 'id_gym'>): Promise<void> {
    if (typeof target === 'number') {
      throw new Error('deleteSpecialSchedule requiere un objeto con id_special_schedule e id_gym');
    }

    const { id_special_schedule, id_gym } = target;

    if (id_special_schedule == null || id_gym == null) {
      throw new Error('id_special_schedule e id_gym son requeridos para delete');
    }

    await apiClient.delete(`/gyms/${id_gym}/special-schedules/${id_special_schedule}`);
  }
}
