import { RewardRepository, Reward, CreateRewardDTO, UpdateRewardDTO, RewardStats } from '@/domain';
import { apiClient } from '../api';
import { RewardResponse } from '../dto/types';
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
    const response = await apiClient.get<RewardResponse[]>('/api/rewards');
    return response.data.map(mapRewardResponseToReward);
  }

  /**
   * Obtener una recompensa por ID
   */
  async getRewardById(id: number): Promise<Reward> {
    const response = await apiClient.get<RewardResponse>(`/api/rewards/${id}`);
    return mapRewardResponseToReward(response.data);
  }

  /**
   * Crear una nueva recompensa
   */
  async createReward(reward: CreateRewardDTO): Promise<Reward> {
    const request = mapCreateRewardDTOToRequest(reward);
    const response = await apiClient.post<RewardResponse>('/api/rewards', request);
    return mapRewardResponseToReward(response.data);
  }

  /**
   * Actualizar una recompensa existente
   */
  async updateReward(reward: UpdateRewardDTO): Promise<Reward> {
    const { id_reward, ...domainData } = reward;
    const request = mapUpdateRewardDTOToRequest(domainData);
    const response = await apiClient.put<RewardResponse>(`/api/rewards/${id_reward}`, request);
    return mapRewardResponseToReward(response.data);
  }

  /**
   * Eliminar una recompensa (soft delete)
   */
  async deleteReward(id: number): Promise<void> {
    await apiClient.delete(`/api/rewards/${id}`);
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
