import { Reward } from '../../domain/entities/Reward';
import { GeneratedCode } from '../../domain/entities/GeneratedCode';
import { RewardDTO, GeneratedCodeDTO } from '../dto/RewardDTO';

export const mapRewardDTOToEntity = (dto: RewardDTO): Reward => ({
  id: dto.id,
  title: dto.title,
  description: dto.description,
  cost: dto.cost,
  category: dto.category,
  icon: dto.icon,
  terms: dto.terms,
  validDays: dto.validDays,
  available: dto.available,
});

export const mapGeneratedCodeDTOToEntity = (dto: GeneratedCodeDTO): GeneratedCode => ({
  id: dto.id,
  rewardId: dto.rewardId,
  code: dto.code,
  title: dto.title,
  generatedAt: dto.generatedAt,
  expiresAt: dto.expiresAt,
  used: dto.used,
  usedAt: dto.usedAt,
});

