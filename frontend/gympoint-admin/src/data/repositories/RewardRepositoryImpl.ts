import { RewardRepository, Reward, CreateRewardDTO, UpdateRewardDTO, RewardStats } from '@/domain';
import { apiClient } from '../api';
import { RewardResponse, PaginatedRewardsResponse } from '../dto/types';
import {
  mapRewardResponseToReward,
  mapCreateRewardDTOToRequest,
  mapUpdateRewardDTOToRequest,
} from '../mappers/CommonMappers';

/**
 * Implementación del repositorio de Recompensas
 */
export class RewardRepositoryImpl implements RewardRepository {
  /**
   * Obtener todas las recompensas (admin - sin filtros)
   */
  async getAllRewards(): Promise<Reward[]> {
    const response = await apiClient.get<PaginatedRewardsResponse>('/rewards');
    return response.data.items.map(mapRewardResponseToReward);
  }

  /**
   * Obtener una recompensa por ID
   */
  async getRewardById(id: number): Promise<Reward> {
    const response = await apiClient.get<RewardResponse>(`/rewards/${id}`);
    return mapRewardResponseToReward(response.data);
  }

  /**
   * Crear una nueva recompensa
   */
  async createReward(reward: CreateRewardDTO): Promise<Reward> {
    const request = mapCreateRewardDTOToRequest(reward);
    const response = await apiClient.post<RewardResponse>('/rewards', request);
    return mapRewardResponseToReward(response.data);
  }

  /**
   * Actualizar una recompensa existente
   */
  async updateReward(reward: UpdateRewardDTO): Promise<Reward> {
    const request = mapUpdateRewardDTOToRequest(reward);
    const response = await apiClient.put<RewardResponse>(`/rewards/${reward.id_reward}`, request);
    return mapRewardResponseToReward(response.data);
  }

  /**
   * Eliminar una recompensa (soft delete)
   */
  async deleteReward(id: number): Promise<void> {
    await apiClient.delete(`/rewards/${id}`);
  }

  /**
   * Obtener estadísticas de recompensas
   * TODO: Agregar endpoint de stats al OpenAPI
   */
  async getRewardStats(): Promise<RewardStats[]> {
    const response = await apiClient.get<{ message: string; data: RewardStats[] }>('/admin/rewards/stats');
    return response.data.data;
  }
}
