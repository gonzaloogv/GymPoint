/**
 * Horario Especial de Gimnasio
 * Para feriados, eventos especiales, cierres temporales, etc.
 */
export interface GymSpecialSchedule {
  id_special_schedule: number;
  id_gym: number;
  date: string; // Fecha específica (YYYY-MM-DD)
  opening_time: string | null; // HH:MM
  closing_time: string | null; // HH:MM
  closed: boolean; // Si está cerrado todo el día
  motive: string; // Motivo del horario especial
  created_at: string;
  updated_at: string;
}

/**
 * DTO para crear un horario especial
 */
export interface CreateGymSpecialScheduleDTO {
  id_gym: number;
  date: string; // YYYY-MM-DD
  opening_time?: string | null; // HH:MM
  closing_time?: string | null; // HH:MM
  closed: boolean;
  motive: string;
}

/**
 * DTO para actualizar un horario especial
 */
export interface UpdateGymSpecialScheduleDTO extends Partial<CreateGymSpecialScheduleDTO> {
  id_special_schedule: number;
  id_gym: number; // Necesario para construir la URL
}

/**
 * Motivos predefinidos comunes
 */
export const COMMON_SPECIAL_SCHEDULE_MOTIVES = [
  'Feriado Nacional',
  'Día Festivo',
  'Mantenimiento',
  'Evento Especial',
  'Cierre Temporal',
  'Capacitación del Personal',
  'Reparaciones',
  'Navidad',
  'Año Nuevo',
  'Semana Santa',
  'Otro',
] as const;


