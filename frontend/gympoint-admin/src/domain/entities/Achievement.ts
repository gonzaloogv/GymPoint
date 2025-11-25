export type AchievementCategory =
  | 'ONBOARDING'
  | 'STREAK'
  | 'FREQUENCY'
  | 'ATTENDANCE'
  | 'ROUTINE'
  | 'CHALLENGE'
  | 'PROGRESS'
  | 'TOKEN'
  | 'SOCIAL';

export type AchievementMetricType =
  | 'STREAK_DAYS'
  | 'STREAK_RECOVERY_USED'
  | 'ASSISTANCE_TOTAL'
  | 'FREQUENCY_WEEKS_MET'
  | 'ROUTINE_COMPLETED_COUNT'
  | 'WORKOUT_SESSION_COMPLETED'
  | 'DAILY_CHALLENGE_COMPLETED_COUNT'
  | 'PR_RECORD_COUNT'
  | 'BODY_WEIGHT_PROGRESS'
  | 'TOKEN_BALANCE_REACHED'
  | 'TOKEN_SPENT_TOTAL'
  | 'ONBOARDING_STEP_COMPLETED';

export interface AchievementMetadata {
  token_reward?: number;
  unlock_message?: string;
  icon?: string;
  [key: string]: unknown;
}

export interface AchievementDefinition {
  id_achievement_definition: number;
  code: string;
  name: string;
  description?: string | null;
  category: AchievementCategory;
  metric_type: AchievementMetricType;
  target_value: number;
  metadata?: AchievementMetadata | null;
  icon_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AchievementQueryParams {
  category?: AchievementCategory;
  includeInactive?: boolean;
}

export interface AchievementDefinitionInput {
  code: string;
  name: string;
  description?: string | null;
  category: AchievementCategory;
  metric_type: AchievementMetricType;
  target_value: number;
  metadata?: AchievementMetadata | null;
  icon_url?: string | null;
  is_active?: boolean;
}

export interface UpdateAchievementDefinitionInput extends AchievementDefinitionInput {
  id_achievement_definition: number;
}
