import { apiClient } from '@shared/http/apiClient';
import {
  UserRoutineApiResponse,
  ActiveRoutineApiResponse,
  EndRoutineApiResponse,
  UserRoutineCountsApiResponse,
  AssignRoutineRequestDTO,
} from '../dto/UserRoutineDTO';

/**
 * UserRoutine API Service
 * Maneja todas las llamadas HTTP a los endpoints de UserRoutine
 */

const BASE_PATH = '/api/user-routines';

export const userRoutineApi = {
  /**
   * POST /api/user-routines
   * Asignar una rutina al usuario
   */
  assign: async (request: AssignRoutineRequestDTO): Promise<UserRoutineApiResponse> => {
    const response = await apiClient.post<UserRoutineApiResponse>(BASE_PATH, request);
    return response.data;
  },

  /**
   * GET /api/user-routines/me
   * Obtener la rutina activa del usuario (sin ejercicios)
   */
  getActive: async (): Promise<UserRoutineApiResponse> => {
    const response = await apiClient.get<UserRoutineApiResponse>(`${BASE_PATH}/me`);
    return response.data;
  },

  /**
   * GET /api/user-routines/me/active-routine
   * Obtener la rutina activa con todos los ejercicios
   */
  getActiveWithExercises: async (): Promise<ActiveRoutineApiResponse> => {
    const response = await apiClient.get<ActiveRoutineApiResponse>(
      `${BASE_PATH}/me/active-routine`
    );
    return response.data;
  },

  /**
   * PUT /api/user-routines/me/end
   * Finalizar la rutina activa del usuario
   */
  endActive: async (): Promise<EndRoutineApiResponse> => {
    const response = await apiClient.put<EndRoutineApiResponse>(`${BASE_PATH}/me/end`);
    return response.data;
  },

  /**
   * GET /api/user-routines/me/counts
   * Obtener contadores de rutinas del usuario (si existe)
   */
  getCounts: async (): Promise<UserRoutineCountsApiResponse> => {
    const response = await apiClient.get<UserRoutineCountsApiResponse>(`${BASE_PATH}/me/counts`);
    return response.data;
  },
};
