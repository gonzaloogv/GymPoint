import { Exercise } from './Exercise';

/**
 * Nivel de dificultad de la rutina
 */
export type RoutineDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

/**
 * Estado de una rutina
 */
export type RoutineStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';

/**
 * Día de una rutina
 */
export interface RoutineDay {
  id_routine_day: number;
  id_routine: number;
  day_number: number;
  title: string | null;
  description: string | null;
  created_at?: string;
  updated_at?: string;
  exercises?: RoutineExercise[]; // Ejercicios de este día específico
}

/**
 * Routine Entity - Dominio
 * Representa una rutina de ejercicios según la API del backend
 */
export interface Routine {
  id_routine: number;
  id?: number; // Alias para compatibilidad con componentes
  routine_name: string;
  description: string | null;
  created_by: number;
  is_template: boolean;
  recommended_for: RoutineDifficulty | string | null;
  template_order: number;
  created_at: string; // ISO date
  updated_at: string; // ISO date
  objective?: string; // Objetivo de la rutina (opcional)
  days?: RoutineDay[]; // Días de la rutina
  exercises?: RoutineExercise[];
}

/**
 * Alias para plantillas de rutina
 */
export type RoutineTemplate = Routine;

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

/**
 * DTO para crear una plantilla de rutina
 */
export interface CreateRoutineTemplateDTO {
  routine_name: string;
  description?: string;
  recommended_for: RoutineDifficulty;
  template_order?: number;
  days?: {
    day_number: number;
    title?: string;
    description?: string;
  }[];
  exercises: {
    id_exercise: number;
    series: number;
    reps: number;
    order: number;
    day_number?: number; // Opcional: día al que pertenece el ejercicio
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
  { value: 'BEGINNER' as const, label: 'Principiante', icon: '🟢', color: '#22c55e' },
  { value: 'INTERMEDIATE' as const, label: 'Intermedio', icon: '🟡', color: '#eab308' },
  { value: 'ADVANCED' as const, label: 'Avanzado', icon: '🔴', color: '#ef4444' },
] as const;

/**
 * Registro de rutina importada desde plantilla
 */
export interface UserImportedRoutine {
  id_import: number;
  id_user_profile: number;
  id_template_routine: number; // Plantilla original
  id_user_routine: number; // Copia del usuario
  imported_at: string; // ISO date
  templateRoutine?: Routine; // Plantilla original (opcional)
  userRoutine?: Routine; // Copia del usuario (opcional)
}

/**
 * Respuesta de importar plantilla
 */
export interface ImportTemplateResponse {
  id_routine_copy: number;
  routine: Routine;
}
