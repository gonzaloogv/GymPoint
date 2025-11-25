// src/features/rewards/domain/entities/ClaimedReward.ts

import { Reward } from './Reward';

export type ClaimedRewardId = string;

export type ClaimedRewardStatus = 'PENDING' | 'ACTIVE' | 'USED' | 'EXPIRED';

export interface ClaimedReward {
  id: ClaimedRewardId;
  userId: number;
  rewardId: number;
  codeId?: number | null;
  claimedDate: string;
  status: ClaimedRewardStatus;
  tokensSpent: number;
  usedAt?: string | null;
  expiresAt?: string | null;
  reward?: Reward | null;
  code?: string | null;
}
