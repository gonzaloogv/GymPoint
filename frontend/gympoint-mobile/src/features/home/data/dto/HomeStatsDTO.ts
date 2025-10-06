export interface HomeStatsDTO {
  name: string;
  plan: 'Free' | 'Premium';
  tokens: number;
  streak: number;
}

export interface WeeklyProgressDTO {
  goal: number;
  current: number;
  percentage: number;
}

export interface DailyChallengeDTO {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
}
