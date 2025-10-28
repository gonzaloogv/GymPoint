// src/features/rewards/domain/entities/Reward.ts

export type RewardId = string;

export type RewardType =
  | 'descuento'
  | 'pase_gratis'
  | 'producto'
  | 'servicio'
  | 'merchandising'
  | 'otro';

export type RewardCategory = 'gym' | 'lifestyle' | 'premium';

export interface Reward {
  // API Fields
  id: RewardId;
  gymId?: number | null;
  name: string;
  description: string;
  rewardType?: RewardType | null;
  tokenCost: number;
  discountPercentage?: number | null;
  discountAmount?: number | null;
  stock?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive: boolean;
  imageUrl?: string | null;
  terms?: string | null;
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
