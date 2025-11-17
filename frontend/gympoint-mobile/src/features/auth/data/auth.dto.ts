// DTOs alineados con backend OpenAPI spec (lotes 1-3)

// ============================================================================
// Auth DTOs
// ============================================================================

export type LoginRequestDTO = {
  email: string;
  password: string;
};

export type RegisterRequestDTO = {
  email: string;
  password: string;
  name: string;
  lastname: string;
  gender?: 'M' | 'F' | 'O';
  locality?: string | null;
  birth_date?: string | null;
  frequency_goal?: number;
};

export type GoogleLoginRequestDTO = {
  idToken: string;
};

export type RefreshTokenRequestDTO = {
  refreshToken: string;
};

export type LogoutRequestDTO = {
  refreshToken: string;
};

// ============================================================================
// Auth Response DTOs
// ============================================================================

export type AuthTokenPairDTO = {
  accessToken: string;
  refreshToken: string;
};

export type UserProfileSummaryDTO = {
  id_user_profile: number;
  name: string;
  lastname: string;
  subscription: 'FREE' | 'PREMIUM';
  premium_since?: string | null;
  tokens_balance?: number;
  tokens_lifetime?: number;
  locality?: string | null;
  gender?: 'M' | 'F' | 'O' | null;
  birth_date?: string | null;
};

export type AuthUserDTO = {
  id_account: number;
  email: string;
  email_verified: boolean;
  auth_provider?: 'local' | 'google';
  profile_completed?: boolean;
  roles: string[];
  profile: UserProfileSummaryDTO;
};

export type AuthSuccessResponseDTO = {
  tokens: AuthTokenPairDTO;
  user: AuthUserDTO;
  needsOnboarding?: boolean;
};

export type CompleteOnboardingRequestDTO = {
  frequency_goal: number;
  birth_date: string;
  gender?: 'M' | 'F' | 'O';
};

export type CompleteOnboardingResponseDTO = {
  success: boolean;
  message: string;
  user: AuthUserDTO;
  needsOnboarding: boolean;
};

export type RefreshTokenResponseDTO = {
  token: string;
  refreshToken?: string;
};

// Backward compatibility (deprecated - usar AuthSuccessResponseDTO)
export type LoginResponseDTO = AuthSuccessResponseDTO;
export type RegisterResponseDTO = AuthSuccessResponseDTO;

// ============================================================================
// Users/Profile DTOs
// ============================================================================

export type UserProfileResponseDTO = {
  id_user_profile: number;
  id_account: number;
  name: string;
  lastname: string;
  email: string;
  email_verified?: boolean;
  auth_provider?: 'local' | 'google';
  profile_completed?: boolean;
  gender?: 'M' | 'F' | 'O' | null;
  locality?: string | null;
  birth_date?: string | null;
  subscription: 'FREE' | 'PREMIUM';
  premium_since?: string | null;
  tokens_balance: number;
  tokens_lifetime: number;
  profile_picture_url?: string | null;
  created_at: string;
  updated_at: string;
};

export type UpdateUserProfileRequestDTO = {
  name?: string;
  lastname?: string;
  gender?: 'M' | 'F' | 'O';
  locality?: string;
  birth_date?: string | null;
};

export type UpdateEmailRequestDTO = {
  email: string;
};

export type EmailUpdateResponseDTO = {
  email: string;
  email_verified: boolean;
  message?: string;
};

export type RequestAccountDeletionRequestDTO = {
  reason?: string;
};

export type AccountDeletionResponseDTO = {
  scheduled_date: string;
  grace_period_days: number;
  message: string;
};

export type AccountDeletionStatusResponseDTO = {
  is_pending: boolean;
  scheduled_date?: string | null;
  grace_period_days?: number;
};

export type NotificationSettingsResponseDTO = {
  id_setting: number;
  id_user_profile: number;
  reminders_enabled: boolean;
  achievements_enabled: boolean;
  rewards_enabled: boolean;
  gym_updates_enabled: boolean;
  payment_enabled: boolean;
  social_enabled: boolean;
  system_enabled: boolean;
  challenge_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  created_at: string;
  updated_at: string;
};

export type UpdateNotificationSettingsRequestDTO = {
  reminders_enabled?: boolean;
  achievements_enabled?: boolean;
  rewards_enabled?: boolean;
  gym_updates_enabled?: boolean;
  payment_enabled?: boolean;
  social_enabled?: boolean;
  system_enabled?: boolean;
  challenge_enabled?: boolean;
  push_enabled?: boolean;
  email_enabled?: boolean;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
};

// ============================================================================
// Error DTO
// ============================================================================

export type ErrorDTO = {
  code: string;
  message: string;
  details?: Array<Record<string, unknown>>;
};

// Legacy - para compatibilidad con código existente
export type MeResponseDTO = UserProfileResponseDTO;
