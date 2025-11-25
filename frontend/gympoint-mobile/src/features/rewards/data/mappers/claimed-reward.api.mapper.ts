// src/features/rewards/data/mappers/claimed-reward.api.mapper.ts

import { ClaimedReward, ClaimedRewardStatus } from '../../domain/entities/ClaimedReward';
import { ClaimedRewardResponseDTO } from '../dto/claimed-reward.api.dto';
import { mapRewardResponseDTOToEntity } from './reward.api.mapper';

export const mapClaimedRewardResponseDTOToEntity = (dto: ClaimedRewardResponseDTO): ClaimedReward => {
  return {
    id: String(dto.id_claimed_reward),
    userId: dto.id_user_profile,
    rewardId: dto.id_reward,
    codeId: dto.id_code,
    claimedDate: dto.claimed_date,
    status: dto.status as ClaimedRewardStatus,
    tokensSpent: dto.tokens_spent,
    usedAt: dto.used_at,
    expiresAt: dto.expires_at,
    reward: dto.reward ? mapRewardResponseDTOToEntity(dto.reward) : null,
    code: dto.code?.code || null,
  };
};

export const mapClaimedRewardResponseDTOArrayToEntityArray = (
  dtos: ClaimedRewardResponseDTO[]
): ClaimedReward[] => {
  return dtos.map(mapClaimedRewardResponseDTOToEntity);
};
