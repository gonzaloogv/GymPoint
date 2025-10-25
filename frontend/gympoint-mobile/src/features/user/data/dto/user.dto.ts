// ============================================================================
// USER PROFILE DTOs - Alineados con backend
// ============================================================================

export type SubscriptionType = 'FREE' | 'PREMIUM';
export type RoleDTO = 'USER' | 'ADMIN' | 'PREMIUM';

/**
 * DTO de respuesta para perfil de usuario completo
 * Desde: GET /api/users/me
 */
export interface UserProfileResponseDTO {
  id_user_profile: number;
  id_account: number;
  email: string;
  name: string;
  lastname: string;
  gender: string | null;
  birth_date: string | null;
  locality: string | null;
  subscription: SubscriptionType;
  premium_since: string | null;
  premium_expires: string | null;
  tokens: number;
  profile_picture_url: string | null;
  preferred_language: string;
  timezone: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * DTO de respuesta para frecuencia semanal
 * Desde: GET /api/frequency/me
 */
export interface FrequencyResponseDTO {
  id_frequency: number;
  id_user: number;
  goal: number;
  assist: number;
  achieved_goal: boolean;
  userProfile?: {
    name: string;
    lastname: string;
  };
}

/**
 * DTO de respuesta para racha (streak)
 * Desde: GET /api/streak/me
 */
export interface StreakResponseDTO {
  id_streak: number;
  value: number;
  last_value: number;
  recovery_items: number;
  user?: {
    id_user_profile: number;
    name: string;
    lastname: string;
  };
  frequency?: {
    goal: number;
    assist: number;
    achieved_goal: boolean;
  };
}

// ============================================================================
// LEGACY DTOs - Para mantener compatibilidad con código existente
// ============================================================================

export interface UserProfileDTO {
  id_user: number;
  name: string;
  email: string;
  role: RoleDTO;
  tokens: number;
  plan: 'Free' | 'Premium';
  streak?: number;
  avatar?: string;
}

export interface UserStatsDTO {
  totalCheckIns: number;
  longestStreak: number;
  favoriteGym: string;
  monthlyVisits: number;
}

export interface NotificationSettingsDTO {
  checkinReminders: boolean;
  streakAlerts: boolean;
  rewardUpdates: boolean;
  marketing: boolean;
}
