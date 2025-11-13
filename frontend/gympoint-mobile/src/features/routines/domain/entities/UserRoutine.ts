import { Routine } from './Routine';

/**
 * UserRoutine Entity - Dominio
 * Representa la asignación de una rutina a un usuario
 */
export interface UserRoutine {
  id_user_routine: number;
  id_user: number; // id_user_profile en DB, pero la API devuelve id_user
  id_routine: number;
  start_date: string; // ISO date
  finish_date: string | null; // ISO date
  active: boolean;
  created_at?: string; // ISO date
  updated_at?: string; // ISO date
  routine?: Routine; // Información de la rutina (opcional)
}

/**
 * Active User Routine with full details
 * Incluye la rutina completa con ejercicios
 */
export interface ActiveUserRoutineWithDetails {
  id_routine: number;
  routine_name: string;
  description: string | null;
  exercises?: ActiveRoutineExercise[];
}

/**
 * Exercise in active routine with full details
 */
export interface ActiveRoutineExercise {
  id_exercise: number;
  exercise_name: string;
  muscular_group: string;
  difficulty_level?: string;
  description?: string | null;
  equipment_needed?: string | null;
  instructions?: string | null;
  video_url?: string | null;
  // Datos de RoutineExercise
  series: number | null;
  reps: number | null;
  order: number | null;
}

/**
 * Assign Routine Request
 */
export interface AssignRoutineRequest {
  id_routine: number;
  start_date?: string; // ISO date, opcional
}

/**
 * User Routine Counts
 */
export interface UserRoutineCounts {
  total_owned: number;
  imported_count: number;
  created_count: number;
}
