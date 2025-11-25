import {
  UserProfileResponseDTO,
  FrequencyResponseDTO,
  StreakResponseDTO,
} from '../dto/user.dto';
import { UserProfile } from '../../domain/entities/UserProfile';
import { UserStats } from '../../domain/entities/UserStats';

/**
 * Mapper: UserProfileResponseDTO → UserProfile Entity
 * Transforma el DTO del backend a la entidad del dominio
 */
export const mapUserProfileDTOToEntity = (dto: UserProfileResponseDTO): UserProfile => {
  // Construir nombre completo con fallback
  const fullName = [dto.name, dto.lastname].filter(Boolean).join(' ').trim();
  const displayName = fullName || dto.name || dto.lastname || 'Usuario';

  return {
    id_user: dto.id_user_profile,
    name: displayName,
    email: dto.email,
    role: dto.subscription === 'PREMIUM' ? 'PREMIUM' : 'USER',
    tokens: dto.tokens,
    plan: dto.subscription === 'PREMIUM' ? 'Premium' : 'Free',
    streak: undefined, // Se obtiene de StreakResponseDTO
    avatar: dto.profile_picture_url || undefined,
    lastname: dto.lastname,
    gender: dto.gender || undefined,
    locality: dto.locality || undefined,
    birth_date: dto.birth_date || undefined,
  };
};

/**
 * Mapper: FrequencyResponseDTO → parte de UserProfile
 * Agrega información de frecuencia al perfil
 */
export const enrichProfileWithFrequency = (
  profile: UserProfile,
  frequency: FrequencyResponseDTO
): UserProfile => {
  return {
    ...profile,
    // Podemos agregar propiedades adicionales si es necesario
  };
};

/**
 * Mapper: StreakResponseDTO → parte de UserProfile
 * Agrega información de racha al perfil
 */
export const enrichProfileWithStreak = (
  profile: UserProfile,
  streak: StreakResponseDTO
): UserProfile => {
  return {
    ...profile,
    streak: streak.value,
  };
};

/**
 * Mapper: Combina UserProfile + Frequency + Streak → UserProfile completo
 * Crea un perfil completo con toda la información necesaria
 */
export const mapCompleteUserProfile = (
  profileDTO: UserProfileResponseDTO,
  frequencyDTO: FrequencyResponseDTO | null,
  streakDTO: StreakResponseDTO | null
): UserProfile => {
  let profile = mapUserProfileDTOToEntity(profileDTO);

  if (frequencyDTO) {
    profile = enrichProfileWithFrequency(profile, frequencyDTO);
  }

  if (streakDTO) {
    profile = enrichProfileWithStreak(profile, streakDTO);
  }

  return profile;
};

/**
 * Mapper temporal para UserStats
 * TODO: Implementar cuando tengamos el endpoint real de estadísticas
 */
export const mapUserStatsDTOToEntity = (
  profile: UserProfileResponseDTO,
  frequency: FrequencyResponseDTO | null,
  streak: StreakResponseDTO | null
): UserStats => {
  return {
    totalCheckIns: frequency?.assist || 0,
    longestStreak: streak?.last_value || 0,
    favoriteGym: 'N/A', // TODO: Obtener del backend
    monthlyVisits: 0, // TODO: Obtener del backend
  };
};
