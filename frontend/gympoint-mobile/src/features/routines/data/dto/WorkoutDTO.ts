/**
 * Workout DTOs - Data Transfer Objects
 * Representan la estructura de datos que viene/va a la API de Workouts
 */

/**
 * WorkoutSession DTO from API
 */
export interface WorkoutSessionDTO {
  id_workout_session: number;
  id_user_profile: number;
  id_routine: number | null;
  id_routine_day: number | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  started_at: string; // ISO date
  finished_at: string | null; // ISO date
  duration_seconds: number | null;
  total_sets: number;
  total_reps: number;
  total_weight: string | number; // Puede venir como string del backend
  notes: string | null;
  created_at: string;
  updated_at: string;
  routine?: {
    id_routine: number;
    routine_name: string;
  };
}

/**
 * WorkoutSet DTO from API
 */
export interface WorkoutSetDTO {
  id_workout_set: number;
  id_workout_session: number;
  id_exercise: number;
  set_number: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null; // Rate of Perceived Exertion
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

/**
 * Start Workout Session Request DTO
 */
export interface StartWorkoutSessionRequestDTO {
  id_routine?: number;
  id_routine_day?: number;
  started_at?: string; // ISO date
  notes?: string;
}

/**
 * Register Workout Set Request DTO
 */
export interface RegisterWorkoutSetRequestDTO {
  id_exercise: number;
  weight?: number;
  reps?: number;
  rpe?: number;
  rest_seconds?: number;
  is_warmup?: boolean;
  notes?: string;
}

/**
 * Update Workout Set Request DTO
 */
export interface UpdateWorkoutSetRequestDTO {
  weight?: number;
  reps?: number;
  rpe?: number;
  rest_seconds?: number;
  notes?: string;
}

/**
 * Complete Workout Session Request DTO
 */
export interface CompleteWorkoutSessionRequestDTO {
  ended_at?: string; // ISO date
  notes?: string;
}

/**
 * Update Workout Session Request DTO
 */
export interface UpdateWorkoutSessionRequestDTO {
  notes?: string;
}

/**
 * API Response wrappers
 */
export interface WorkoutSessionApiResponse {
  message?: string;
  data: WorkoutSessionDTO;
}

export interface WorkoutSessionsApiResponse {
  message?: string;
  data: WorkoutSessionDTO[];
}

export interface WorkoutSetApiResponse {
  message?: string;
  data: WorkoutSetDTO;
}

export interface WorkoutSetsApiResponse {
  message?: string;
  data: WorkoutSetDTO[];
}

export interface WorkoutStatsApiResponse {
  message?: string;
  data: {
    total_sessions: number;
    completed_sessions: number;
    total_sets: number;
    total_reps: number;
    total_weight: number;
    avg_duration_minutes: number;
  };
}
