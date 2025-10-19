/**
 * Nivel de dificultad de la rutina
 */
export type RoutineDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

/**
 * Plantilla de Rutina
 */
export interface RoutineTemplate {
  id_routine: number;
  routine_name: string;
  description: string | null;
  recommended_for: RoutineDifficulty | null;
  is_template: boolean;
  created_by: number | null; // ID del admin que la creó
  template_order: number;
  created_at?: string;
  updated_at?: string;
  exercises?: RoutineExercise[]; // Ejercicios de la rutina
}

/**
 * Ejercicio dentro de una rutina
 */
export interface RoutineExercise {
  id_routine_exercise: number;
  id_routine: number;
  id_exercise: number;
  series: number;
  reps: number;
  order: number;
  exercise?: Exercise; // Información del ejercicio
}

/**
 * Ejercicio base
 */
export interface Exercise {
  id_exercise: number;
  exercise_name: string;
  description: string | null;
  muscular_group: string | null;
  equipment_needed: string | null;
  difficulty: string | null;
  instructions: string | null;
  video_url: string | null;
  created_by?: number | null;
}

/**
 * DTO para crear un ejercicio
 */
export interface CreateExerciseDTO {
  exercise_name: string;
  description?: string;
  muscular_group?: string;
  equipment_needed?: string;
  difficulty?: string;
  instructions?: string;
  video_url?: string;
}

/**
 * DTO para actualizar un ejercicio
 */
export interface UpdateExerciseDTO {
  id_exercise: number;
  exercise_name?: string;
  description?: string;
  muscular_group?: string;
  equipment_needed?: string;
  difficulty?: string;
  instructions?: string;
  video_url?: string;
}

/**
 * DTO para crear una plantilla de rutina
 */
export interface CreateRoutineTemplateDTO {
  routine_name: string;
  description?: string;
  recommended_for: RoutineDifficulty;
  template_order?: number;
  exercises: {
    id_exercise: number;
    series: number;
    reps: number;
    order: number;
  }[];
}

/**
 * DTO para actualizar metadata de plantilla
 */
export interface UpdateRoutineTemplateDTO {
  id_routine: number;
  routine_name?: string;
  description?: string;
  recommended_for?: RoutineDifficulty;
  template_order?: number;
}

/**
 * Opciones de dificultad con etiquetas
 */
export const DIFFICULTY_OPTIONS = [
  { value: 'BEGINNER', label: 'Principiante', icon: '🟢', color: '#22c55e' },
  { value: 'INTERMEDIATE', label: 'Intermedio', icon: '🟡', color: '#eab308' },
  { value: 'ADVANCED', label: 'Avanzado', icon: '🔴', color: '#ef4444' },
] as const;


