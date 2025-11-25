/**
 * Entidad de Recompensa
 */
export interface Reward {
  id_reward: number;
  name: string;
  description: string;
  reward_type: string;
  effect_value?: number | null; // Valor del efecto (ej: días de premium, % descuento)
  cost_tokens: number;
  cooldown_days?: number | null;
  is_unlimited?: boolean;
  requires_premium?: boolean;
  is_stackable?: boolean;
  max_stack?: number | null;
  duration_days?: number | null;
  available: boolean;
  stock: number | null;
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
  reward_type: string;
  effect_value?: number | null; // Valor del efecto según reward_type
  cost_tokens: number;
  cooldown_days?: number;
  is_unlimited?: boolean;
  requires_premium?: boolean;
  is_stackable?: boolean;
  max_stack?: number | null;
  duration_days?: number | null;
  stock: number | null;
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
  'token_multiplier',
  'streak_saver',
  'otro'
] as const;

export type RewardType = typeof REWARD_TYPES[number];
