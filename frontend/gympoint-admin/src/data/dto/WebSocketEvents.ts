/**
 * Tipos TypeScript para eventos de WebSocket
 * Mantiene sincronizados los tipos entre frontend y backend
 */

// ========== Gym Requests ==========

export interface GymRequestCreatedData {
  gymRequest: any; // Usar el tipo real de GymRequest del backend
  timestamp: string;
}

export interface GymRequestApprovedData {
  requestId: number;
  gymId: number;
  gymRequest: any;
  gym: any;
  timestamp: string;
}

export interface GymRequestRejectedData {
  requestId: number;
  gymRequest: any;
  reason: string;
  timestamp: string;
}

// ========== User Management ==========

export interface UserTokensUpdatedData {
  newBalance: number;
  previousBalance: number;
  delta: number;
  reason: string;
  timestamp: string;
}

export interface UserSubscriptionUpdatedData {
  previousSubscription: string;
  newSubscription: string;
  isPremium: boolean;
  premiumSince?: string;
  premiumExpires?: string;
  timestamp: string;
}

export interface UserSubscriptionChangedData {
  userId: number;
  accountId: number;
  newSubscription: string;
  isPremium: boolean;
  timestamp: string;
}

export interface UserProfileUpdatedData {
  profile: any;
  timestamp: string;
}

// ========== Admin Stats ==========

export interface AdminStatsUpdatedData {
  stats: {
    totalUsers?: number;
    premiumUsers?: number;
    totalGyms?: number;
    pendingRequests?: number;
    [key: string]: any;
  };
  timestamp: string;
}

// ========== Connection ==========

export interface ConnectionSuccessData {
  message: string;
  userId: number;
  timestamp: string;
}

// ========== Event Types ==========

export type WebSocketEventType =
  | 'gym:request:created'
  | 'gym:request:approved'
  | 'gym:request:rejected'
  | 'user:subscription:changed'
  | 'admin:stats:updated'
  | 'connection:success'
  | 'error';

// ========== Event Handlers ==========

export type WebSocketEventHandler<T = any> = (data: T) => void;

export interface WebSocketEventHandlers {
  'gym:request:created'?: WebSocketEventHandler<GymRequestCreatedData>;
  'gym:request:approved'?: WebSocketEventHandler<GymRequestApprovedData>;
  'gym:request:rejected'?: WebSocketEventHandler<GymRequestRejectedData>;
  'user:subscription:changed'?: WebSocketEventHandler<UserSubscriptionChangedData>;
  'admin:stats:updated'?: WebSocketEventHandler<AdminStatsUpdatedData>;
  'connection:success'?: WebSocketEventHandler<ConnectionSuccessData>;
}
