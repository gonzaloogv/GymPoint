import { RoutineDTO, RoutineExerciseDTO } from './RoutineDTO';

/**
 * UserRoutine DTOs - Data Transfer Objects
 * Representan la estructura de datos que viene/va a la API de UserRoutines
 */

/**
 * UserRoutine DTO from API
 */
export interface UserRoutineDTO {
  id_user_routine: number;
  id_user: number;
  id_routine: number;
  start_date: string; // ISO date
  finish_date: string | null; // ISO date
  active: boolean;
  created_at?: string;
  updated_at?: string;
  routine?: RoutineDTO; // Opcional, incluido cuando se pide con detalles
}

/**
 * Active User Routine with exercises DTO
 * Respuesta de GET /api/user-routines/me/active-routine
 */
export interface ActiveUserRoutineWithDetailsDTO {
  id_routine: number;
  routine_name: string;
  description: string | null;
  Exercises?: ActiveRoutineExerciseDTO[]; // Mayúscula por el alias de Sequelize
  exercises?: ActiveRoutineExerciseDTO[]; // Minúscula por compatibilidad
}

/**
 * Exercise in active routine with full data
 */
export interface ActiveRoutineExerciseDTO {
  id_exercise: number;
  exercise_name: string;
  muscular_group: string;
  difficulty_level?: string;
  difficulty?: string; // Alias alternativo
  description?: string | null;
  equipment_needed?: string | null;
  instructions?: string | null;
  video_url?: string | null;
  created_at?: string;
  updated_at?: string;
  // Datos de la tabla intermedia RoutineExercise
  RoutineExercise?: {
    sets: number | null;
    reps: number | null;
    exercise_order: number | null;
  };
}

/**
 * Assign Routine Request DTO
 */
export interface AssignRoutineRequestDTO {
  id_routine: number;
  start_date?: string; // ISO date
}

/**
 * User Routine Counts DTO
 */
export interface UserRoutineCountsDTO {
  total_owned: number;
  imported_count: number;
  created_count: number;
}

/**
 * API Response wrappers
 */
export interface UserRoutineApiResponse {
  message: string;
  data: UserRoutineDTO;
}

export interface ActiveRoutineApiResponse {
  message: string;
  data: ActiveUserRoutineWithDetailsDTO;
}

export interface UserRoutineCountsApiResponse {
  data: UserRoutineCountsDTO;
}

export interface EndRoutineApiResponse {
  message: string;
  data: UserRoutineDTO;
}

/**
 * Error responses
 */
export interface UserRoutineErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
