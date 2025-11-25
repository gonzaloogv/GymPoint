export type DailyChallengeType = 'MINUTES' | 'EXERCISES' | 'FREQUENCY';
export type DailyChallengeDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface DailyChallengeTemplate {
  id_template: number;
  title: string;
  description: string | null;
  challenge_type: DailyChallengeType;
  target_value: number;
  target_unit: string | null;
  tokens_reward: number;
  difficulty: DailyChallengeDifficulty;
  rotation_weight: number;
  is_active: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface DailyChallengeConfig {
  id_config: number;
  auto_rotation_enabled: boolean;
  rotation_cron: string;
  updated_at: string;
}

export interface DailyChallenge {
  id_challenge: number;
  challenge_date: string;
  title: string;
  description: string | null;
  challenge_type: DailyChallengeType;
  target_value: number;
  target_unit: string | null;
  tokens_reward: number;
  difficulty: DailyChallengeDifficulty;
  is_active: boolean;
  id_template: number | null;
  auto_generated: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  template?: DailyChallengeTemplate | null;
}

export interface CreateDailyChallengeDTO {
  challenge_date: string;
  title: string;
  description?: string;
  challenge_type: DailyChallengeType;
  target_value: number;
  target_unit?: string;
  tokens_reward?: number;
  difficulty?: DailyChallengeDifficulty;
  is_active?: boolean;
  id_template?: number | null;
  auto_generated?: boolean;
}

export interface UpdateDailyChallengeDTO extends Partial<CreateDailyChallengeDTO> {
  id_challenge: number;
}

export interface CreateDailyChallengeTemplateDTO {
  title: string;
  description?: string;
  challenge_type: DailyChallengeType;
  target_value: number;
  target_unit?: string;
  tokens_reward?: number;
  difficulty?: DailyChallengeDifficulty;
  rotation_weight?: number;
  is_active?: boolean;
}

export interface UpdateDailyChallengeTemplateDTO extends Partial<CreateDailyChallengeTemplateDTO> {
  id_template: number;
}
