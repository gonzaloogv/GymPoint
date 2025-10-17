/**
 * Desafío Diario
 */
export interface DailyChallenge {
  id_challenge: number;
  date: string; // YYYY-MM-DD
  description: string;
  points: number;
  type: ChallengeType;
  created_at: string;
  stats?: {
    total_completions: number;
    completion_rate: number;
  };
}

/**
 * Tipos de desafíos
 */
export type ChallengeType = 
  | 'CHECK_IN'
  | 'WORKOUT_TIME'
  | 'CALORIES'
  | 'EXERCISES'
  | 'STREAK'
  | 'SOCIAL'
  | 'OTHER';

/**
 * Estadísticas de desafíos
 */
export interface ChallengeStats {
  total_challenges: number;
  total_completions: number;
  avg_completion_rate: number;
  top_challenges: Array<{
    id_challenge: number;
    description: string;
    completion_count: number;
  }>;
}

/**
 * DTO para crear un desafío
 */
export interface CreateDailyChallengeDTO {
  date: string; // YYYY-MM-DD
  description: string;
  points: number;
  type: ChallengeType;
}

/**
 * DTO para actualizar un desafío
 */
export interface UpdateDailyChallengeDTO extends Partial<CreateDailyChallengeDTO> {
  id_challenge: number;
}

/**
 * Tipos de desafíos con etiquetas
 */
export const CHALLENGE_TYPES = [
  { value: 'CHECK_IN', label: 'Check-in', icon: '📍' },
  { value: 'WORKOUT_TIME', label: 'Tiempo de Entrenamiento', icon: '⏱️' },
  { value: 'CALORIES', label: 'Calorías', icon: '🔥' },
  { value: 'EXERCISES', label: 'Ejercicios', icon: '💪' },
  { value: 'STREAK', label: 'Racha', icon: '🔥' },
  { value: 'SOCIAL', label: 'Social', icon: '👥' },
  { value: 'OTHER', label: 'Otro', icon: '🎯' },
] as const;

