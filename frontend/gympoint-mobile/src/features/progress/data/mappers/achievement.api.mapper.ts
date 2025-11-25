import { Achievement, AchievementCategory } from '../../domain/entities/Achievement';
import { UserAchievementResponseDTO } from '../dto/achievement.api.dto';

const getAchievementIcon = (category: string, metadata?: any): string => {
  if (metadata?.icon) return metadata.icon;
  switch (category) {
    case 'ONBOARDING': return '🎯';
    case 'STREAK': return '🔥';
    case 'FREQUENCY': return '📅';
    case 'ATTENDANCE': return '✅';
    case 'ROUTINE': return '💪';
    case 'CHALLENGE': return '🏆';
    case 'PROGRESS': return '📈';
    case 'TOKEN': return '⚡';
    case 'SOCIAL': return '👥';
    default: return '🏅';
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const mapUserAchievementResponseDTOToEntity = (dto: UserAchievementResponseDTO): Achievement => {
  const icon = getAchievementIcon(dto.category, dto.metadata);
  const earnedPoints = dto.metadata?.token_reward || 0;
  const now = new Date().toISOString();

  return {
    // API fields
    id: String(dto.id),
    code: dto.code,
    name: dto.name,
    description: dto.description,
    category: dto.category as AchievementCategory,
    targetValue: dto.progress.denominator, // El target real puede variar
    currentProgress: dto.progress.value, // Valor actual del progreso
    metadata: dto.metadata,
    iconUrl: dto.icon_url,
    isActive: dto.is_active,
    isUnlocked: dto.unlocked, // Estado de desbloqueo
    unlockedAt: dto.unlocked_at,
    createdAt: now,
    updatedAt: now,

    // Computed/UI fields
    title: dto.name,
    icon,
    earnedPoints,
    date: dto.unlocked_at ? formatDate(dto.unlocked_at) : undefined,

    // Unlock fields (solo presentes al desbloquear)
    earnedTokens: (dto as any).earnedTokens, // Tokens otorgados con multiplicador
    tokenReward: (dto as any).tokenReward, // Tokens base
    multiplier: (dto as any).multiplier, // Multiplicador aplicado
    unlockMessage: (dto as any).unlockMessage, // Mensaje personalizado
  };
};

export const mapUserAchievementResponseDTOArrayToEntityArray = (dtos: UserAchievementResponseDTO[]): Achievement[] => {
  return dtos.map(mapUserAchievementResponseDTOToEntity);
};
