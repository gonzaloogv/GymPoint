export type AchievementId = string;
export type AchievementCategory = 'ONBOARDING' | 'STREAK' | 'FREQUENCY' | 'ATTENDANCE' | 'ROUTINE' | 'CHALLENGE' | 'PROGRESS' | 'TOKEN' | 'SOCIAL';
export interface Achievement {
  id: AchievementId;
  code: string;
  name: string;
  description?: string | null;
  category: AchievementCategory;
  targetValue: number;
  currentProgress?: number;
  metadata?: { token_reward?: number; unlock_message?: string; icon?: string; } | null;
  iconUrl?: string | null;
  isActive: boolean;
  isUnlocked?: boolean;
  unlockedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  title: string;
  icon: string;
  earnedPoints: number;
  date?: string;
  // Campos adicionales para desbloqueo
  earnedTokens?: number; // Tokens otorgados (con multiplicador)
  tokenReward?: number; // Tokens base
  multiplier?: number; // Multiplicador aplicado
  unlockMessage?: string; // Mensaje personalizado al desbloquear
}