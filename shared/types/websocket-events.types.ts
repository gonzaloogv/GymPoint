export interface TokensUpdatedPayload {
  userId?: number;
  accountId?: number;
  newBalance: number;
  previousBalance: number;
  delta: number;
  reason?: string;
  timestamp: string;
}

export interface SubscriptionUpdatedPayload {
  userId?: number;
  accountId?: number;
  previousSubscription: string;
  newSubscription: string;
  isPremium: boolean;
  premiumSince?: string;
  premiumExpires?: string;
  timestamp: string;
}

export interface AttendanceRecordedPayload {
  attendanceId: number;
  userId?: number;
  gymId: number;
  tokensAwarded?: number;
  newBalance?: number;
  streak?: number;
  timestamp: string;
}

export interface WeeklyProgressUpdatedPayload {
  userId?: number;
  goal: number;
  current: number;
  achieved: boolean;
  percentage?: number;
  weekStart?: string;
  weekNumber?: number;
  year?: number;
  timestamp: string;
}

export interface GymRequestPayload {
  requestId?: number;
  gymId?: number;
  gymRequest?: any;
  gym?: any;
  reason?: string;
  timestamp: string;
}

export interface AchievementUnlockedPayload {
  achievementId: number;
  name: string;
  description: string;
  points: number;
}

export interface RewardEarnedPayload {
  rewardId: number;
  name: string;
  type: string;
}
