// src/features/rewards/data/dto/reward.api.dto.ts

export interface RewardResponseDTO {
  id_reward: number;
  id_gym?: number | null;
  name: string;
  description: string;
  reward_type?: 'descuento' | 'pase_gratis' | 'producto' | 'servicio' | 'merchandising' | 'token_multiplier' | 'streak_saver' | 'otro' | null;
  effect_value?: number | null;
  token_cost: number;
  cooldown_days?: number | null;
  is_unlimited?: boolean | null;
  requires_premium?: boolean | null;
  is_stackable?: boolean | null;
  max_stack?: number | null;
  duration_days?: number | null;
  discount_percentage?: number | null;
  discount_amount?: number | null;
  stock?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active: boolean;
  image_url?: string | null;
  terms?: string | null;
  can_claim?: boolean | null;
  current_stack?: number | null;
  cooldown_ends_at?: string | null;
  cooldown_hours_remaining?: number | null;
  reason?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface PaginatedRewardsResponseDTO {
  items: RewardResponseDTO[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RewardInventoryItemDTO {
  id_inventory: number;
  id_user_profile: number;
  id_reward: number;
  item_type: 'streak_saver' | 'token_multiplier';
  quantity: number;
  max_stack: number;
  created_at: string;
  updated_at: string;
  reward: RewardResponseDTO; // Reward completo populated
}

export interface RewardInventoryResponseDTO {
  inventory: RewardInventoryItemDTO[];
}

export interface ActiveRewardEffectDTO {
  id_effect: number;
  id_user_profile: number;
  effect_type: 'token_multiplier';
  multiplier_value: number;
  started_at: string;
  expires_at: string;
  is_consumed: boolean;
  created_at: string;
  hours_remaining?: number; // Computed field
}

export interface ActiveEffectsResponseDTO {
  effects: ActiveRewardEffectDTO[];
  total_multiplier: number;
}

// Request/Response para claim reward
export interface ClaimRewardRequestDTO {
  code?: string;
}

export interface ClaimRewardResponseDTO {
  message: string;
  claimed_reward: {
    id_claimed_reward: number;
    status: string;
    claimed_at: string;
    expires_at: string | null;
  };
  new_balance: number;
}
