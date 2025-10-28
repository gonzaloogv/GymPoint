// src/features/rewards/data/reward.remote.ts

import { apiClient } from '@shared/http/apiClient';
import { RewardResponseDTO, PaginatedRewardsResponseDTO } from './dto/reward.api.dto';

export class RewardRemote {
  /**
   * GET /api/rewards
   * Lista todas las recompensas disponibles (paginado)
   */
  async listRewards(params?: { available?: boolean }): Promise<RewardResponseDTO[]> {
    const queryParams = new URLSearchParams();

    if (params?.available !== undefined) {
      queryParams.append('available', String(params.available));
    }

    const queryString = queryParams.toString();
    const url = `/api/rewards${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<PaginatedRewardsResponseDTO>(url);

    // La API devuelve un objeto paginado, extraemos el array de items
    return response.data.items || [];
  }

  /**
   * GET /api/rewards/:id
   * Obtiene una recompensa específica por ID
   */
  async getRewardById(id: number): Promise<RewardResponseDTO> {
    const response = await apiClient.get<RewardResponseDTO>(`/api/rewards/${id}`);
    return response.data;
  }
}
