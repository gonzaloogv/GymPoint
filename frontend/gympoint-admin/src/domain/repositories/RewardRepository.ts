import { Reward, CreateRewardDTO, UpdateRewardDTO, RewardStats } from '../entities';

/**
 * Interface del repositorio de Recompensas
 */
export interface RewardRepository {
  /**
   * Obtener todas las recompensas
   */
  getAllRewards(): Promise<Reward[]>;

  /**
   * Obtener una recompensa por ID
   */
  getRewardById(id: number): Promise<Reward>;

  /**
   * Crear una nueva recompensa
   */
  createReward(reward: CreateRewardDTO): Promise<Reward>;

  /**
   * Actualizar una recompensa existente
   */
  updateReward(reward: UpdateRewardDTO): Promise<Reward>;

  /**
   * Eliminar una recompensa (soft delete)
   */
  deleteReward(id: number): Promise<void>;

  /**
   * Obtener estadísticas de recompensas
   */
  getRewardStats(): Promise<RewardStats[]>;
}




