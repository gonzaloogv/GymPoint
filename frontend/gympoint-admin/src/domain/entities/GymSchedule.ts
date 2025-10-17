export interface GymSchedule {
  id_schedule: number;
  id_gym: number;
  day_of_week: string;
  opening_time: string | null;
  closing_time: string | null;
  closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateGymScheduleDTO {
  id_gym: number;
  day_of_week: string;
  opening_time?: string;
  closing_time?: string;
  closed: boolean;
}

export interface UpdateGymScheduleDTO {
  id_schedule: number;
  opening_time?: string;
  closing_time?: string;
  closed?: boolean;
}

export const DAYS_OF_WEEK = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];




