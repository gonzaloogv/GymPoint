import { UserProfile } from '../../domain/entities/UserProfile';
import { UserStats } from '../../domain/entities/UserStats';
import { NotificationSettings } from '../../domain/entities/NotificationSettings';
import {
  UserProfileDTO,
  UserStatsDTO,
  NotificationSettingsDTO,
} from '../dto/UserProfileDTO';

export const mapUserProfileDTOToEntity = (dto: UserProfileDTO): UserProfile => ({
  id_user: dto.id_user,
  name: dto.name,
  email: dto.email,
  role: dto.role,
  tokens: dto.tokens,
  plan: dto.plan,
  streak: dto.streak,
  avatar: dto.avatar,
});

export const mapUserStatsDTOToEntity = (dto: UserStatsDTO): UserStats => ({
  totalCheckIns: dto.totalCheckIns,
  longestStreak: dto.longestStreak,
  favoriteGym: dto.favoriteGym,
  monthlyVisits: dto.monthlyVisits,
});
