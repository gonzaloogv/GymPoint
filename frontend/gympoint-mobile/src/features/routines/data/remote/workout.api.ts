import { apiClient } from '@shared/http/apiClient';
import {
  WorkoutSessionApiResponse,
  WorkoutSessionsApiResponse,
  WorkoutSetApiResponse,
  WorkoutSetsApiResponse,
  WorkoutStatsApiResponse,
  StartWorkoutSessionRequestDTO,
  RegisterWorkoutSetRequestDTO,
  UpdateWorkoutSetRequestDTO,
  CompleteWorkoutSessionRequestDTO,
  UpdateWorkoutSessionRequestDTO,
} from '../dto/WorkoutDTO';

/**
 * Workout API Service
 * Maneja todas las llamadas HTTP a los endpoints de Workout
 */

const BASE_PATH = '/api/workouts';

export const workoutApi = {
  /**
   * POST /api/workouts/sessions
   * Iniciar una nueva sesión de entrenamiento
   */
  startSession: async (request: StartWorkoutSessionRequestDTO): Promise<WorkoutSessionApiResponse> => {
    const response = await apiClient.post<WorkoutSessionApiResponse>(
      `${BASE_PATH}/sessions`,
      request
    );
    return response.data;
  },

  /**
   * GET /api/workouts/sessions/active
   * Obtener la sesión activa del usuario
   */
  getActiveSession: async (): Promise<WorkoutSessionApiResponse> => {
    const response = await apiClient.get<WorkoutSessionApiResponse>(
      `${BASE_PATH}/sessions/active`
    );
    return response.data;
  },

  /**
   * GET /api/workouts/sessions/me
   * Listar sesiones del usuario
   */
  getMySessions: async (params?: {
    status?: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    id_routine?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }): Promise<WorkoutSessionsApiResponse> => {
    const response = await apiClient.get<WorkoutSessionsApiResponse>(
      `${BASE_PATH}/sessions/me`,
      { params }
    );
    return response.data;
  },

  /**
   * GET /api/workouts/sessions/:id
   * Obtener sesión por ID
   */
  getSessionById: async (id: number): Promise<WorkoutSessionApiResponse> => {
    const response = await apiClient.get<WorkoutSessionApiResponse>(
      `${BASE_PATH}/sessions/${id}`
    );
    return response.data;
  },

  /**
   * PUT /api/workouts/sessions/:id
   * Actualizar metadata de sesión (notas)
   */
  updateSession: async (
    id: number,
    request: UpdateWorkoutSessionRequestDTO
  ): Promise<WorkoutSessionApiResponse> => {
    const response = await apiClient.put<WorkoutSessionApiResponse>(
      `${BASE_PATH}/sessions/${id}`,
      request
    );
    return response.data;
  },

  /**
   * PUT /api/workouts/sessions/:id/complete
   * Completar una sesión
   */
  completeSession: async (
    id: number,
    request?: CompleteWorkoutSessionRequestDTO
  ): Promise<WorkoutSessionApiResponse> => {
    const response = await apiClient.put<WorkoutSessionApiResponse>(
      `${BASE_PATH}/sessions/${id}/complete`,
      request || {}
    );
    return response.data;
  },

  /**
   * PUT /api/workouts/sessions/:id/cancel
   * Cancelar una sesión
   */
  cancelSession: async (id: number): Promise<WorkoutSessionApiResponse> => {
    const response = await apiClient.put<WorkoutSessionApiResponse>(
      `${BASE_PATH}/sessions/${id}/cancel`
    );
    return response.data;
  },

  /**
   * GET /api/workouts/stats
   * Obtener estadísticas de workout
   */
  getStats: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<WorkoutStatsApiResponse> => {
    const response = await apiClient.get<WorkoutStatsApiResponse>(
      `${BASE_PATH}/stats`,
      { params }
    );
    return response.data;
  },

  /**
   * GET /api/workouts/sessions/:id/sets
   * Listar sets de una sesión
   */
  getSessionSets: async (
    sessionId: number,
    exerciseId?: number
  ): Promise<WorkoutSetsApiResponse> => {
    const response = await apiClient.get<WorkoutSetsApiResponse>(
      `${BASE_PATH}/sessions/${sessionId}/sets`,
      { params: exerciseId ? { id_exercise: exerciseId } : undefined }
    );
    return response.data;
  },

  /**
   * POST /api/workouts/sessions/:id/sets
   * Registrar un set en una sesión
   */
  registerSet: async (
    sessionId: number,
    request: RegisterWorkoutSetRequestDTO
  ): Promise<WorkoutSetApiResponse> => {
    const response = await apiClient.post<WorkoutSetApiResponse>(
      `${BASE_PATH}/sessions/${sessionId}/sets`,
      request
    );
    return response.data;
  },

  /**
   * PUT /api/workouts/sets/:id
   * Actualizar un set
   */
  updateSet: async (
    setId: number,
    request: UpdateWorkoutSetRequestDTO
  ): Promise<WorkoutSetApiResponse> => {
    const response = await apiClient.put<WorkoutSetApiResponse>(
      `${BASE_PATH}/sets/${setId}`,
      request
    );
    return response.data;
  },

  /**
   * DELETE /api/workouts/sets/:id
   * Eliminar un set
   */
  deleteSet: async (setId: number): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/sets/${setId}`);
  },

  /**
   * POST /api/workouts/exercises/last-sets
   * Obtener los últimos sets de ejercicios específicos
   */
  getLastSetsForExercises: async (
    exerciseIds: number[]
  ): Promise<{
    data: Array<{
      id_exercise: number;
      last_weight: number;
      last_reps: number;
      has_history: boolean;
    }>;
  }> => {
    const response = await apiClient.post<{
      data: Array<{
        id_exercise: number;
        last_weight: number;
        last_reps: number;
        has_history: boolean;
      }>;
    }>(`${BASE_PATH}/exercises/last-sets`, {
      exercise_ids: exerciseIds,
    });
    return response.data;
  },
};
