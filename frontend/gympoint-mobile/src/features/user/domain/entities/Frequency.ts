export interface Frequency {
  id_frequency: number;
  id_user: number;
  goal: number;
  pending_goal: number | null;
  assist: number;
  achieved_goal: boolean;
  week_start_date: string | null;
  week_number: number | null;
  year: number | null;
}
