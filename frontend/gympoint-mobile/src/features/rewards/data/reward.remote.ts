// src/features/rewards/data/reward.remote.ts

import { apiClient } from '@shared/http/apiClient';
import { RewardResponseDTO, PaginatedRewardsResponseDTO } from './dto/reward.api.dto';
import {
  ClaimedRewardResponseDTO,
  PaginatedClaimedRewardsResponseDTO,
  ClaimRewardRequestDTO,
} from './dto/claimed-reward.api.dto';

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

  /**
   * POST /api/rewards/:rewardId/claim
   * Canjea una recompensa por tokens
   */
  async claimReward(rewardId: number, request: ClaimRewardRequestDTO): Promise<ClaimedRewardResponseDTO> {
    const response = await apiClient.post<ClaimedRewardResponseDTO>(
      `/api/rewards/${rewardId}/claim`,
      request
    );
    return response.data;
  }

  /**
   * GET /api/users/:userId/claimed-rewards
   * Lista recompensas canjeadas por un usuario
   */
  async listClaimedRewards(userId: number, params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ClaimedRewardResponseDTO[]> {
    const queryParams = new URLSearchParams();

    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.page) {
      queryParams.append('page', String(params.page));
    }
    if (params?.limit) {
      queryParams.append('limit', String(params.limit));
    }

    const queryString = queryParams.toString();
    const url = `/api/users/${userId}/claimed-rewards${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<PaginatedClaimedRewardsResponseDTO>(url);

    return response.data.items || [];
  }

  /**
   * GET /api/claimed-rewards/:claimedRewardId
   * Obtiene una recompensa canjeada específica
   */
  async getClaimedRewardById(claimedRewardId: number): Promise<ClaimedRewardResponseDTO> {
    const response = await apiClient.get<ClaimedRewardResponseDTO>(
      `/api/claimed-rewards/${claimedRewardId}`
    );
    return response.data;
  }

  /**
   * POST /api/claimed-rewards/:claimedRewardId/use
   * Marca una recompensa canjeada como usada
   */
  async markClaimedRewardAsUsed(claimedRewardId: number): Promise<ClaimedRewardResponseDTO> {
    const response = await apiClient.post<ClaimedRewardResponseDTO>(
      `/api/claimed-rewards/${claimedRewardId}/use`
    );
    return response.data;
  }
}
