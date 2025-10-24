import { GymRepository, Gym, CreateGymDTO, UpdateGymDTO } from '@/domain';
import { apiClient } from '../api';
import { GymResponse, PaginatedGymsResponse } from '../dto/types';
import {
  mapGymResponseToGym,
  mapCreateGymDTOToRequest,
  mapUpdateGymDTOToRequest,
} from '../mappers/GymMappers';

/**
 * Implementación del repositorio de Gyms usando DTOs del OpenAPI
 */
export class GymRepositoryImpl implements GymRepository {
  /**
   * Obtener todos los gimnasios (con paginación opcional)
   */
  async getAllGyms(): Promise<Gym[]> {
    // El endpoint real del backend usa paginación: /gyms?page=1&limit=100
    const response = await apiClient.get<PaginatedGymsResponse>('/gyms', {
      params: { page: 1, limit: 100 },
    });
    return response.data.items.map(mapGymResponseToGym);
  }

  /**
   * Obtener un gimnasio por ID
   */
  async getGymById(id: number): Promise<Gym> {
    const response = await apiClient.get<GymResponse>(`/api/gyms/${id}`);
    return mapGymResponseToGym(response.data);
  }

  /**
   * Crear un nuevo gimnasio
   */
  async createGym(gym: CreateGymDTO): Promise<Gym> {
    const request = mapCreateGymDTOToRequest(gym);
    const response = await apiClient.post<GymResponse>('/gyms', request);
    return mapGymResponseToGym(response.data);
  }

  /**
   * Actualizar un gimnasio existente
   */
  async updateGym(gym: UpdateGymDTO): Promise<Gym> {
    const { id_gym } = gym;
    const request = mapUpdateGymDTOToRequest(gym);
    const response = await apiClient.put<GymResponse>(`/api/gyms/${id_gym}`, request);
    return mapGymResponseToGym(response.data);
  }

  /**
   * Eliminar un gimnasio (soft delete)
   */
  async deleteGym(id: number): Promise<void> {
    await apiClient.delete(`/api/gyms/${id}`);
  }

  /**
   * Obtener tipos de gimnasio disponibles
   * Nota: Este endpoint puede no estar definido en el OpenAPI, verificar implementación del backend
   */
  async getGymTypes(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/gyms/tipos');
    return response.data;
  }
}
