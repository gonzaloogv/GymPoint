/**
 * Tipos de datos para el módulo de Usuario
 */

// Tipo del plan de usuario
export type Role = 'USER' | 'ADMIN' | 'PREMIUM';

export interface UserProfile {
  id_user: number; // usa siempre id_user si querés mantenerlo consistente
  name: string;
  email: string;
  role: Role;
  tokens: number;
  plan: 'Free' | 'Premium';
  streak?: number; // opcional si no siempre lo tenés
  avatar?: string; // opcional
}

// Interfaz para las estadísticas del usuario
export interface UserStats {
  totalCheckIns: number;
  longestStreak: number;
  favoriteGym: string;
  monthlyVisits: number;
}

// Interfaz para las configuraciones de notificaciones
export interface NotificationSettings {
  checkinReminders: boolean;
  streakAlerts: boolean;
  rewardUpdates: boolean;
  marketing: boolean;
}

// Props para la pantalla principal
export interface UserProfileScreenProps {
  user: UserProfile | null;
  onLogout?: () => void;
  onUpdateUser?: (user: UserProfile) => void;
  navigation?: any;
}

//
