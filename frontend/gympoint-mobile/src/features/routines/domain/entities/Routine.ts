import { Exercise } from './Exercise';

/**
 * Routine Entity - Dominio
 * Representa una rutina de ejercicios según la API del backend
 */
export interface Routine {
  id_routine: number;
  routine_name: string;
  description: string | null;
  created_by: number;
  is_template: boolean;
  recommended_for: string | null;
  template_order: number;
  created_at: string; // ISO date
  updated_at: string; // ISO date
  exercises?: RoutineExercise[];
}

/**
 * Exercise within a Routine
 * Incluye datos del ejercicio + datos de la relación RoutineExercise
 */
export interface RoutineExercise {
  id_exercise: number;
  exercise_name: string;
  muscular_group: string;
  difficulty_level?: string;
  description?: string | null;
  series?: number | null; // Número de series (del through table)
  reps?: number | null; // Número de repeticiones (del through table)
  order?: number | null; // Orden del ejercicio en la rutina (del through table)
}

/**
 * Create Routine Request
 */
export interface CreateRoutineRequest {
  routine_name: string;
  description?: string;
  exercises: CreateRoutineExercise[];
  days?: CreateRoutineDay[];
}

export interface CreateRoutineExercise {
  id_exercise: number;
  series: number;
  reps: string; // Puede ser "10" o "8-12"
  order: number;
  day_number?: number;
}

export interface CreateRoutineDay {
  day_number: number;
  title: string;
  description?: string;
}

/**
 * Update Routine Request
 */
export interface UpdateRoutineRequest {
  routine_name?: string;
  description?: string;
  exercises?: CreateRoutineExercise[];
}
