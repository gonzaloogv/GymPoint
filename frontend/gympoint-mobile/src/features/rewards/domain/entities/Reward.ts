// src/features/rewards/domain/entities/Reward.ts

export type RewardId = string;

export type RewardType =
  | 'descuento'
  | 'pase_gratis'
  | 'producto'
  | 'servicio'
  | 'merchandising'
  | 'token_multiplier'
  | 'streak_saver'
  | 'otro';

export type RewardCategory = 'gym' | 'lifestyle' | 'premium';

export interface Reward {
  // API Fields
  id: RewardId;
  gymId?: number | null;
  name: string;
  description: string;
  rewardType?: RewardType | null;
  effectValue?: number | null;
  tokenCost: number;
  cooldownDays?: number | null;
  isUnlimited?: boolean | null;
  requiresPremium?: boolean | null;
  isStackable?: boolean | null;
  maxStack?: number | null;
  durationDays?: number | null;
  discountPercentage?: number | null;
  discountAmount?: number | null;
  stock?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive: boolean;
  imageUrl?: string | null;
  terms?: string | null;
  canClaim?: boolean | null;
  currentStack?: number | null;
  cooldownEndsAt?: string | null;
  cooldownHoursRemaining?: number | null;
  reason?: string | null;
  createdAt: string;
  updatedAt: string;

  // Computed/UI Fields
  title: string; // alias for name
  cost: number; // alias for tokenCost
  category: RewardCategory;
  icon: string;
  validDays: number;
  available: boolean;
}

export interface RewardInventoryItem {
  id: number;
  userId: number;
  rewardId: number;
  itemType: 'streak_saver' | 'token_multiplier';
  quantity: number;
  maxStack: number;
  createdAt: string;
  updatedAt: string;
  reward: Reward; // Reward completo populated
}

export interface ActiveRewardEffect {
  id: number;
  userId?: number;
  effectType: 'token_multiplier';
  multiplierValue: number;
  startedAt: string;
  expiresAt: string;
  isConsumed?: boolean;
  createdAt?: string;
  hoursRemaining: number;
}

export interface ActiveEffectsSummary {
  effects: ActiveRewardEffect[];
  totalMultiplier: number;
}
