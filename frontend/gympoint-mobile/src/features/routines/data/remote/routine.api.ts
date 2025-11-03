import { apiClient } from '@shared/http/apiClient';
import {
  RoutineApiResponse,
  RoutinesApiResponse,
  RoutineCountsApiResponse,
  CreateRoutineRequestDTO,
  UpdateRoutineRequestDTO,
} from '../dto/RoutineDTO';

/**
 * Routine API Service
 * Maneja todas las llamadas HTTP a los endpoints de Routine
 */

const BASE_PATH = '/api/routines';

export const routineApi = {
  /**
   * POST /api/routines
   * Crear una nueva rutina
   */
  create: async (request: CreateRoutineRequestDTO): Promise<RoutineApiResponse> => {
    const response = await apiClient.post<RoutineApiResponse>(BASE_PATH, request);
    return response.data;
  },

  /**
   * GET /api/routines/me
   * Obtener rutinas del usuario actual
   */
  getMyRoutines: async (): Promise<RoutinesApiResponse> => {
    const response = await apiClient.get<RoutinesApiResponse>(`${BASE_PATH}/me`);
    return response.data;
  },

  /**
   * GET /api/routines/templates
   * Obtener rutinas plantilla
   */
  getTemplates: async (): Promise<RoutinesApiResponse> => {
    const response = await apiClient.get<RoutinesApiResponse>(`${BASE_PATH}/templates`);
    return response.data;
  },

  /**
   * GET /api/routines/:id
   * Obtener una rutina por ID
   */
  getById: async (id: number): Promise<RoutineApiResponse> => {
    const response = await apiClient.get<RoutineApiResponse>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * PUT /api/routines/:id
   * Actualizar una rutina
   */
  update: async (id: number, request: UpdateRoutineRequestDTO): Promise<RoutineApiResponse> => {
    const response = await apiClient.put<RoutineApiResponse>(`${BASE_PATH}/${id}`, request);
    return response.data;
  },

  /**
   * DELETE /api/routines/:id
   * Eliminar una rutina
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * POST /api/routines/:id/clone
   * Clonar una rutina
   */
  clone: async (id: number): Promise<RoutineApiResponse> => {
    const response = await apiClient.post<RoutineApiResponse>(`${BASE_PATH}/${id}/clone`);
    return response.data;
  },

  /**
   * GET /api/routines/me/count
   * Obtener contadores de rutinas
   */
  getMyRoutinesCounts: async (): Promise<RoutineCountsApiResponse> => {
    const response = await apiClient.get<RoutineCountsApiResponse>(`${BASE_PATH}/me/count`);
    return response.data;
  },
};
