export interface UserProfileDTO {
  id_user_profile: number;
  name: string;
  lastname: string;
  email: string;
  tokens: number;
  subscription?: 'FREE' | 'PREMIUM';
}

export interface FrequencyDTO {
  id_frequency: number;
  id_user: number;
  goal: number;
  assist: number;
  achieved_goal: boolean;
}

export interface StreakDTO {
  id_streak: number;
  value: number;
  last_value: number | null;
  recovery_items: number;
}

export interface DailyChallengeDTO {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  unit?: string | null;
  completed: boolean;
  challengeType?: string | null;
  date?: string | null;
}
