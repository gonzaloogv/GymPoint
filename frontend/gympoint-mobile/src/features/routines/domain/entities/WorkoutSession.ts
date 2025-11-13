/**
 * WorkoutSession Domain Entity
 * Representa una sesión de entrenamiento en el dominio
 */

export interface WorkoutSession {
  id_workout_session: number;
  id_user_profile: number;
  id_routine: number | null;
  id_routine_day: number | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  started_at: string;
  finished_at: string | null;
  duration_seconds: number | null;
  total_sets: number;
  total_reps: number;
  total_weight: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  routine?: {
    id_routine: number;
    routine_name: string;
  };
}

export interface WorkoutSet {
  id_workout_set: number;
  id_workout_session: number;
  id_exercise: number;
  set_number: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  rest_seconds: number | null;
  is_warmup: boolean;
  notes: string | null;
  created_at: string;
  exercise?: {
    id_exercise: number;
    exercise_name: string;
    muscular_group: string;
  };
}

export interface StartWorkoutSessionRequest {
  id_routine?: number;
  id_routine_day?: number;
  started_at?: string;
  notes?: string;
}

export interface RegisterWorkoutSetRequest {
  id_exercise: number;
  weight?: number;
  reps?: number;
  rpe?: number;
  rest_seconds?: number;
  is_warmup?: boolean;
  notes?: string;
}

export interface UpdateWorkoutSetRequest {
  weight?: number;
  reps?: number;
  rpe?: number;
  rest_seconds?: number;
  notes?: string;
}

export interface CompleteWorkoutSessionRequest {
  ended_at?: string;
  notes?: string;
}

export interface WorkoutStats {
  total_sessions: number;
  completed_sessions: number;
  total_sets: number;
  total_reps: number;
  total_weight: number;
  avg_duration_minutes: number;
}
