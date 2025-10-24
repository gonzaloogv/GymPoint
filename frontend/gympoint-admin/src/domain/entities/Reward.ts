/**
 * Entidad de Recompensa
 */
export interface Reward {
  id_reward: number;
  name: string;
  description: string;
  type: string;
  cost_tokens: number;
  available: boolean;
  stock: number;
  start_date: string | null; // ISO date string
  finish_date: string | null; // ISO date string
  image_url?: string | null; // URL de la imagen de la recompensa
  terms?: string | null; // Términos y condiciones
  creation_date: string;
  deleted_at: string | null;
}

/**
 * DTO para crear una nueva recompensa
 */
export interface CreateRewardDTO {
  name: string;
  description: string;
  type: string;
  cost_tokens: number;
  stock: number;
  start_date: string; // Format: YYYY-MM-DD
  finish_date: string; // Format: YYYY-MM-DD
  available?: boolean; // Opcional, por defecto true
  image_url?: string; // URL de la imagen (opcional)
  terms?: string; // Términos y condiciones (opcional)
}

/**
 * DTO para actualizar una recompensa existente
 */
export interface UpdateRewardDTO extends Partial<CreateRewardDTO> {
  id_reward: number;
}

/**
 * Estadísticas de recompensas
 */
export interface RewardStats {
  id_reward: number;
  name: string;
  total_canjes: number;
  total_tokens_gastados: number;
}

/**
 * Tipos de recompensas comunes
 */
export const REWARD_TYPES = [
  'descuento',
  'pase_gratis',
  'producto',
  'servicio',
  'merchandising',
  'otro'
] as const;

export type RewardType = typeof REWARD_TYPES[number];
