// src/shared/types/websocket.types.ts

/**
 * Tipos para eventos de WebSocket
 */

// ============================================================================
// NOTIFICATION EVENTS
// ============================================================================

export interface NotificationPayload {
  id: number;
  type: 'REMINDER' | 'ACHIEVEMENT' | 'REWARD' | 'GYM_UPDATE' | 'PAYMENT' | 'SOCIAL' | 'SYSTEM' | 'CHALLENGE';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  timestamp: string;
}

export interface UnreadCountPayload {
  count: number;
  timestamp: string;
}

// ============================================================================
// PRESENCE EVENTS
// ============================================================================

export interface PresenceUserEnteredPayload {
  userId: number;
  gymId: number;
  timestamp: string;
}

export interface PresenceUserLeftPayload {
  userId: number;
  gymId: number;
  timestamp: string;
}

export interface PresenceUpdatedPayload {
  gymId: number;
  currentCount: number;
  users?: Array<{
    userId: number;
    userName?: string;
  }>;
  timestamp: string;
}

// ============================================================================
// ASSISTANCE & STREAK EVENTS
// ============================================================================

export interface AssistanceNewPayload {
  assistanceId: number;
  userId: number;
  gymId: number;
  checkInTime: string;
  timestamp: string;
}

export interface StreakUpdatedPayload {
  currentStreak: number;
  longestStreak: number;
  lastAssistanceDate?: string;
  timestamp: string;
}

export interface StreakMilestonePayload {
  milestone: number;
  currentStreak: number;
  message: string;
}

export interface StreakLostPayload {
  previousStreak: number;
  longestStreak: number;
  message: string;
  timestamp: string;
}

// ============================================================================
// REVIEW EVENTS
// ============================================================================

export interface ReviewNewPayload {
  reviewId: number;
  gymId: number;
  userId: number;
  rating: number;
  title?: string;
  comment?: string;
  timestamp: string;
}

export interface ReviewUpdatedPayload {
  reviewId: number;
  gymId: number;
  userId: number;
  rating: number;
  title?: string;
  comment?: string;
  timestamp: string;
}

export interface GymRatingUpdatedPayload {
  gymId: number;
  averageRating: number;
  totalReviews: number;
  timestamp?: string;
}

// ============================================================================
// PROGRESS & ATTENDANCE EVENTS
// ============================================================================

export type {
  WeeklyProgressUpdatedPayload,
  AttendanceRecordedPayload,
} from '@root/shared/types/websocket-events.types';

// ============================================================================
// ACHIEVEMENT & REWARD EVENTS
// ============================================================================

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

// ============================================================================
// SYSTEM EVENTS
// ============================================================================

export interface SystemAnnouncementPayload {
  message: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  timestamp: string;
}

export interface ConnectionSuccessPayload {
  message: string;
  userId: number;
  timestamp: string;
}

// ============================================================================
// CLIENT EMIT EVENTS (lo que el cliente envía al servidor)
// ============================================================================

export interface JoinGymData {
  gymId: number;
}

export interface LeaveGymData {
  gymId: number;
}

export interface CheckinData {
  gymId: number;
}

export interface CheckoutData {
  gymId: number;
}

export interface MarkNotificationReadData {
  notificationId: number;
}

// ============================================================================
// WEBSOCKET EVENT NAMES
// ============================================================================

export const WS_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  CONNECTION_SUCCESS: 'connection:success',

  // Notifications - Server to Client
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATIONS_UNREAD_COUNT: 'notifications:unread-count',
  NOTIFICATIONS_SUBSCRIBED: 'notifications:subscribed',
  NOTIFICATIONS_UNSUBSCRIBED: 'notifications:unsubscribed',
  NOTIFICATIONS_READ_SUCCESS: 'notifications:read-success',
  NOTIFICATIONS_ERROR: 'notifications:error',

  // Notifications - Client to Server
  NOTIFICATIONS_SUBSCRIBE: 'notifications:subscribe',
  NOTIFICATIONS_UNSUBSCRIBE: 'notifications:unsubscribe',
  NOTIFICATIONS_MARK_READ: 'notifications:mark-read',
  NOTIFICATIONS_GET_UNREAD_COUNT: 'notifications:get-unread-count',

  // Presence - Server to Client
  PRESENCE_USER_ENTERED: 'presence:user-entered',
  PRESENCE_USER_LEFT: 'presence:user-left',
  PRESENCE_UPDATED: 'presence:updated',
  PRESENCE_JOINED_GYM: 'presence:joined-gym',
  PRESENCE_LEFT_GYM: 'presence:left-gym',
  PRESENCE_CHECKIN_SUCCESS: 'presence:checkin-success',
  PRESENCE_CHECKOUT_SUCCESS: 'presence:checkout-success',
  PRESENCE_ERROR: 'presence:error',

  // Presence - Client to Server
  PRESENCE_JOIN_GYM: 'presence:join-gym',
  PRESENCE_LEAVE_GYM: 'presence:leave-gym',
  PRESENCE_CHECKIN: 'presence:checkin',
  PRESENCE_CHECKOUT: 'presence:checkout',
  PRESENCE_GET_COUNT: 'presence:get-count',

  // Assistance & Streak - Server to Client
  ASSISTANCE_NEW: 'assistance:new',
  ASSISTANCE_CANCELLED: 'assistance:cancelled',
  ASSISTANCE_SUBSCRIBED: 'assistance:subscribed',
  ASSISTANCE_UNSUBSCRIBED: 'assistance:unsubscribed',
  STREAK_UPDATED: 'streak:updated',
  STREAK_MILESTONE: 'streak:milestone',
  STREAK_LOST: 'streak:lost',
  STREAK_SUBSCRIBED: 'streak:subscribed',
  STREAK_UNSUBSCRIBED: 'streak:unsubscribed',
  ASSISTANCE_ERROR: 'assistance:error',

  // Assistance & Streak - Client to Server
  ASSISTANCE_SUBSCRIBE_GYM: 'assistance:subscribe-gym',
  ASSISTANCE_UNSUBSCRIBE_GYM: 'assistance:unsubscribe-gym',
  STREAK_SUBSCRIBE: 'streak:subscribe',
  STREAK_UNSUBSCRIBE: 'streak:unsubscribe',

  // Reviews
  REVIEW_NEW: 'review:new',
  REVIEW_UPDATED: 'review:updated',
  GYM_RATING_UPDATED: 'gym:rating:updated',

  // Achievements & Rewards
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  REWARD_EARNED: 'reward:earned',

  // System
  SYSTEM_ANNOUNCEMENT: 'system:announcement',

  // Progress
  PROGRESS_WEEKLY_UPDATED: 'progress:weekly:updated',
  ATTENDANCE_RECORDED: 'attendance:recorded',
} as const;

export type WebSocketEventName = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];

// ============================================================================
// WEBSOCKET STATE
// ============================================================================

export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

// ============================================================================
// WEBSOCKET CONTEXT TYPE
// ============================================================================

export interface WebSocketContextValue {
  socket: unknown | null; // Socket instance
  connected: boolean;
  connecting: boolean;
  error: string | null;

  // Connection management
  connect: () => Promise<void>;
  disconnect: () => void;

  // Notifications
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;
  markNotificationAsRead: (notificationId: number) => void;

  // Presence
  joinGym: (gymId: number) => void;
  leaveGym: (gymId: number) => void;
  checkin: (gymId: number) => void;
  checkout: (gymId: number) => void;

  // Streak
  subscribeToStreak: () => void;
  unsubscribeFromStreak: () => void;

  // Generic emit
  emit: (event: string, data?: unknown) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback?: (...args: unknown[]) => void) => void;
}
