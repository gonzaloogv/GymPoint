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
  id_gym: number; // Necesario para construir la URL
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

// Mapeo de nombres de días a números (0=Domingo, 1=Lunes, ..., 6=Sábado)
export const DAY_NAME_TO_NUMBER: Record<string, number> = {
  'Domingo': 0,
  'Lunes': 1,
  'Martes': 2,
  'Miércoles': 3,
  'Jueves': 4,
  'Viernes': 5,
  'Sábado': 6,
};

// Mapeo de números a nombres de días
export const DAY_NUMBER_TO_NAME: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};




