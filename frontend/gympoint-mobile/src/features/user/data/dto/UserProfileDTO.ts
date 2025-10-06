export type RoleDTO = 'USER' | 'ADMIN' | 'PREMIUM';

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
