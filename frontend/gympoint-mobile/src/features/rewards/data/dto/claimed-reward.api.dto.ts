// src/features/rewards/data/dto/claimed-reward.api.dto.ts

import { RewardResponseDTO } from './reward.api.dto';

export interface ClaimedRewardResponseDTO {
  id_claimed_reward: number;
  id_user_profile: number;
  id_reward: number;
  id_code?: number | null;
  claimed_date: string;
  status: 'PENDING' | 'ACTIVE' | 'USED' | 'EXPIRED';
  tokens_spent: number;
  used_at?: string | null;
  expires_at?: string | null;
  reward?: RewardResponseDTO | null;
  code?: {
    id_code: number;
    id_reward: number;
    code: string;
    is_used: boolean;
    created_at: string;
  } | null;
}

export interface PaginatedClaimedRewardsResponseDTO {
  items: ClaimedRewardResponseDTO[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ClaimRewardRequestDTO {
  tokens_spent: number;
  code_id?: number;
  expires_at?: string;
}
