// src/features/rewards/data/dto/reward.api.dto.ts

export interface RewardResponseDTO {
  id_reward: number;
  id_gym?: number | null;
  name: string;
  description: string;
  reward_type?: 'descuento' | 'pase_gratis' | 'producto' | 'servicio' | 'merchandising' | 'otro' | null;
  token_cost: number;
  discount_percentage?: number | null;
  discount_amount?: number | null;
  stock?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active: boolean;
  image_url?: string | null;
  terms?: string | null;
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
