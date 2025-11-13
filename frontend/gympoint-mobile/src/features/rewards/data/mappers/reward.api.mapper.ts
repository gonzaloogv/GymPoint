// src/features/rewards/data/mappers/reward.api.mapper.ts

import {
  Reward,
  RewardCategory,
  RewardType,
  RewardInventoryItem,
  ActiveEffectsSummary,
  ActiveRewardEffect,
} from '../../domain/entities/Reward';
import {
  RewardResponseDTO,
  RewardInventoryResponseDTO,
  ActiveEffectsResponseDTO,
} from '../dto/reward.api.dto';

const getRewardCategory = (rewardType?: RewardType | null, stock?: number | null): RewardCategory => {
  if (rewardType === 'pase_gratis' || rewardType === 'servicio') {
    return 'gym';
  }
  if (rewardType === 'producto' || rewardType === 'descuento') {
    return 'lifestyle';
  }
  // Si el stock es limitado o no hay stock, podría ser premium
  if (stock !== null && stock !== undefined && stock < 10) {
    return 'premium';
  }
  return 'gym';
};

const getRewardIcon = (rewardType?: RewardType | null): string => {
  switch (rewardType) {
    case 'pase_gratis':
      return '🏋️';
    case 'descuento':
      return '🎯';
    case 'producto':
      return '🥤';
    case 'servicio':
      return '💆';
    case 'merchandising':
      return '👕';
    case 'token_multiplier':
      return '🔥';
    case 'streak_saver':
      return '🛟';
    default:
      return '🎁';
  }
};

const calculateValidDays = (validFrom?: string | null, validUntil?: string | null): number => {
  if (!validFrom || !validUntil) {
    return 90; // default 90 days
  }

  try {
    const from = new Date(validFrom);
    const until = new Date(validUntil);
    const diffTime = Math.abs(until.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 90;
  } catch {
    return 90;
  }
};

export const mapRewardResponseDTOToEntity = (dto: RewardResponseDTO): Reward => {
  const category = getRewardCategory(dto.reward_type, dto.stock);
  const icon = getRewardIcon(dto.reward_type);
  const validDays = calculateValidDays(dto.valid_from, dto.valid_until);

  return {
    // API fields
    id: String(dto.id_reward),
    gymId: dto.id_gym,
    name: dto.name,
    description: dto.description,
    rewardType: dto.reward_type,
    effectValue: dto.effect_value ?? null,
    tokenCost: dto.token_cost,
    cooldownDays: dto.cooldown_days ?? null,
    isUnlimited: dto.is_unlimited ?? null,
    requiresPremium: dto.requires_premium ?? null,
    isStackable: dto.is_stackable ?? null,
    maxStack: dto.max_stack ?? null,
    durationDays: dto.duration_days ?? null,
    discountPercentage: dto.discount_percentage,
    discountAmount: dto.discount_amount,
    stock: dto.stock,
    validFrom: dto.valid_from,
    validUntil: dto.valid_until,
    isActive: dto.is_active,
    imageUrl: dto.image_url,
    terms: dto.terms,
    canClaim: dto.can_claim ?? null,
    currentStack: dto.current_stack ?? null,
    cooldownEndsAt: dto.cooldown_ends_at ?? null,
    cooldownHoursRemaining: dto.cooldown_hours_remaining ?? null,
    reason: dto.reason ?? null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,

    // Computed/UI fields
    title: dto.name,
    cost: dto.token_cost,
    category,
    icon,
    validDays,
    available: dto.can_claim ?? (dto.is_active && (dto.stock === null || dto.stock > 0)),
  };
};

export const mapRewardResponseDTOArrayToEntityArray = (dtos: RewardResponseDTO[]): Reward[] => {
  return dtos.map(mapRewardResponseDTOToEntity);
};

export const mapRewardInventoryResponseDTOToEntity = (
  dto: RewardInventoryResponseDTO
): RewardInventoryItem[] => {
  if (!dto?.inventory) return [];

  return dto.inventory.map((item) => ({
    id: item.id_inventory,
    userId: item.id_user_profile,
    rewardId: item.id_reward,
    itemType: item.item_type,
    quantity: item.quantity,
    maxStack: item.max_stack,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    reward: mapRewardResponseDTOToEntity(item.reward),
  }));
};

export const mapActiveEffectsResponseDTOToEntity = (
  dto: ActiveEffectsResponseDTO
): ActiveEffectsSummary => {
  const effects: ActiveRewardEffect[] = (dto.effects || []).map((effect) => ({
    id: effect.id_effect,
    effectType: effect.effect_type,
    multiplierValue: effect.multiplier_value,
    startedAt: effect.started_at,
    expiresAt: effect.expires_at,
    hoursRemaining: effect.hours_remaining,
  }));

  return {
    effects,
    totalMultiplier: dto.total_multiplier || 1,
  };
};
