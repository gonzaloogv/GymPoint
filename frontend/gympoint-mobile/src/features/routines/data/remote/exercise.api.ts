import { apiClient } from '@shared/http/apiClient';

/**
 * Exercise API Service
 * Maneja llamadas HTTP a los endpoints de Exercise
 */

export interface ExerciseDTO {
  id_exercise: number;
  exercise_name: string;
  muscular_group: string;
  difficulty_level?: string;
  description?: string | null;
  equipment_needed?: string | null;
  instructions?: string | null;
  video_url?: string | null;
}

export interface ExercisesApiResponse {
  items: ExerciseDTO[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const BASE_PATH = '/api/exercises';

export const exerciseApi = {
  /**
   * GET /api/exercises
   * Obtener todos los ejercicios con filtros opcionales
   */
  getAll: async (params?: {
    muscular_group?: string;
    difficulty_level?: string;
    search?: string;
  }): Promise<ExerciseDTO[]> => {
    console.log('📡 Fetching exercises from backend...', params);
    const response = await apiClient.get<ExercisesApiResponse>(BASE_PATH, { params });
    console.log('✅ Exercises response:', response.data);
    return response.data.items;
  },

  /**
   * GET /api/exercises/:id
   * Obtener un ejercicio por ID
   */
  getById: async (id: number): Promise<ExerciseDTO> => {
    const response = await apiClient.get<ExerciseDTO>(`${BASE_PATH}/${id}`);
    return response.data;
  },
};
