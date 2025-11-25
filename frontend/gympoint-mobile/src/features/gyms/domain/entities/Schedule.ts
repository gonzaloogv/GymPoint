export type Schedule = {
  id_schedule: number;
  id_gym: number;
  day_of_week: 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom';
  opening_time: string; // "08:00:00"
  closing_time: string; // "20:00:00"
  closed: boolean;
};
