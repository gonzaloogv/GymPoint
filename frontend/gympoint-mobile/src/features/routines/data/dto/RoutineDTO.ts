/**
 * Routine DTOs - Data Transfer Objects
 * Representan la estructura de datos que viene/va a la API
 */

/**
 * Exercise DTO from API
 */
export interface ExerciseDTO {
  id_exercise: number;
  exercise_name: string;
  muscular_group: string;
  difficulty_level?: string;
  description?: string | null;
  equipment_needed?: string | null;
  instructions?: string | null;
  video_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Routine Exercise DTO (Exercise + RoutineExercise join data)
 */
export interface RoutineExerciseDTO {
  id_exercise: number;
  exercise_name: string;
  muscular_group: string;
  difficulty_level?: string;
  description?: string | null;
  // Datos de la tabla RoutineExercise (through table)
  series: number; // Número de series
  reps: number; // Número de repeticiones
  order: number; // Orden del ejercicio
}

/**
 * Routine DTO from API
 */
export interface RoutineDTO {
  id_routine: number;
  routine_name: string;
  description: string | null;
  created_by: number;
  is_template: boolean;
  recommended_for: string | null;
  template_order: number;
  created_at: string;
  updated_at: string;
  exercises?: RoutineExerciseDTO[];
}

/**
 * Create Routine Request DTO
 */
export interface CreateRoutineRequestDTO {
  routine_name: string;
  description?: string;
  exercises: CreateRoutineExerciseDTO[];
  days?: CreateRoutineDayDTO[];
}

export interface CreateRoutineExerciseDTO {
  id_exercise: number;
  series: number;
  reps: string; // Puede ser "10" o "8-12" (string en la API)
  order: number;
  day_number?: number;
}

export interface CreateRoutineDayDTO {
  day_number: number;
  title: string;
  description?: string;
}

/**
 * Update Routine Request DTO
 */
export interface UpdateRoutineRequestDTO {
  routine_name?: string;
  description?: string;
  exercises?: CreateRoutineExerciseDTO[];
}

/**
 * API Response wrappers
 */
export interface RoutineApiResponse {
  message: string;
  data: RoutineDTO;
}

export interface RoutinesApiResponse {
  message?: string;
  data: RoutineDTO[];
}

export interface RoutineCountsApiResponse {
  data: {
    total_owned: number;
    imported_count: number;
    created_count: number;
  };
}
