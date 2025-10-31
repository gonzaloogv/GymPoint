import { api } from '@shared/http/apiClient';

export interface CreateBodyMetricDTO {
  date: string; // YYYY-MM-DD
  weight_kg?: number;
  height_cm?: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  waist_cm?: number;
  chest_cm?: number;
  arms_cm?: number;
  notes?: string;
}

export interface BodyMetricResponseDTO {
  id_metric: number;
  id_user_profile: number;
  date: string;
  weight_kg: number | null;
  height_cm: number | null;
  bmi: number | null;
  body_fat_percentage: number | null;
  muscle_mass_kg: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  arms_cm: number | null;
  notes: string | null;
  created_at: string;
}

export interface ListBodyMetricsResponseDTO {
  data: BodyMetricResponseDTO[];
  total: number;
  limit: number;
  offset: number;
}

export interface UpdateBodyMetricDTO {
  weight_kg?: number;
  height_cm?: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  waist_cm?: number;
  chest_cm?: number;
  arms_cm?: number;
  notes?: string;
}

/**
 * API Client para Body Metrics
 */
export const BodyMetricsRemote = {
  /**
   * POST /api/users/me/body-metrics
   * Crear una nueva métrica corporal
   */
  create: async (payload: CreateBodyMetricDTO): Promise<BodyMetricResponseDTO> => {
    const response = await api.post<{ message: string; data: BodyMetricResponseDTO }>(
      '/api/users/me/body-metrics',
      payload
    );

    return response.data.data;
  },

  /**
   * PUT /api/users/me/body-metrics/:id
   * Actualizar una métrica corporal existente
   */
  update: async (id: number, payload: UpdateBodyMetricDTO): Promise<BodyMetricResponseDTO> => {
    const response = await api.put<{ message: string; data: BodyMetricResponseDTO }>(
      `/api/users/me/body-metrics/${id}`,
      payload
    );

    return response.data.data;
  },

  /**
   * GET /api/users/me/body-metrics
   * Listar métricas corporales del usuario
   */
  list: async (params?: { limit?: number; offset?: number }): Promise<ListBodyMetricsResponseDTO> => {
    const response = await api.get<ListBodyMetricsResponseDTO>(
      '/api/users/me/body-metrics',
      { params }
    );

    return response.data;
  },

  /**
   * GET /api/users/me/body-metrics/latest
   * Obtener la última métrica corporal
   */
  getLatest: async (): Promise<BodyMetricResponseDTO | null> => {
    const response = await api.get<BodyMetricResponseDTO | null>(
      '/api/users/me/body-metrics/latest'
    );

    return response.data;
  },
};
