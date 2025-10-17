import { RewardRepository, Reward, CreateRewardDTO, UpdateRewardDTO, RewardStats } from '@/domain';
import { apiClient } from '../api';

/**
 * Implementación del repositorio de Recompensas
 */
export class RewardRepositoryImpl implements RewardRepository {
  /**
   * Obtener todas las recompensas (admin - sin filtros)
   */
  async getAllRewards(): Promise<Reward[]> {
    const response = await apiClient.get<{ message: string; data: Reward[] }>('/admin/rewards/all');
    return response.data.data;
  }

  /**
   * Obtener una recompensa por ID
   */
  async getRewardById(id: number): Promise<Reward> {
    const response = await apiClient.get<{ message: string; data: Reward }>(`/admin/rewards/${id}`);
    return response.data.data;
  }

  /**
   * Crear una nueva recompensa
   */
  async createReward(reward: CreateRewardDTO): Promise<Reward> {
    const response = await apiClient.post<{ message: string; data: Reward }>('/admin/rewards', reward);
    return response.data.data;
  }

  /**
   * Actualizar una recompensa existente
   */
  async updateReward(reward: UpdateRewardDTO): Promise<Reward> {
    const { id_reward, ...data } = reward;
    const response = await apiClient.put<{ message: string; data: Reward }>(`/admin/rewards/${id_reward}`, data);
    return response.data.data;
  }

  /**
   * Eliminar una recompensa (soft delete)
   */
  async deleteReward(id: number): Promise<void> {
    await apiClient.delete(`/admin/rewards/${id}`);
  }

  /**
   * Obtener estadísticas de recompensas
   */
  async getRewardStats(): Promise<RewardStats[]> {
    const response = await apiClient.get<{ message: string; data: RewardStats[] }>('/admin/rewards/stats');
    return response.data.data;
  }
}

