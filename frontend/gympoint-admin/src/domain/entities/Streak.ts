/**
 * Racha de Usuario
 */
export interface Streak {
  id_streak: number;
  id_user: number;
  current_streak: number;
  longest_streak: number;
  last_check_in: string | null; // ISO date
  start_date: string; // ISO date
  created_at: string;
  updated_at: string;
  user?: {
    id_user: number;
    name: string;
    email: string;
  };
}

/**
 * Estadísticas globales de rachas
 */
export interface StreakStats {
  total_users_with_streaks: number;
  avg_current_streak: number;
  avg_longest_streak: number;
  top_current_streaks: Array<{
    id_user: number;
    user_name: string;
    current_streak: number;
  }>;
  top_longest_streaks: Array<{
    id_user: number;
    user_name: string;
    longest_streak: number;
  }>;
}

/**
 * Racha de usuario específico
 */
export interface UserStreak {
  id_user: number;
  current_streak: number;
  longest_streak: number;
  last_check_in: string | null;
  start_date: string;
  is_active: boolean;
}


