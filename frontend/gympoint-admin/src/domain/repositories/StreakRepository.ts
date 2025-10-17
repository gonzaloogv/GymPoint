import { Streak, StreakStats, UserStreak } from '../entities';

export interface StreakRepository {
  getAllStreaks(): Promise<Streak[]>;
  getUserStreak(id_user: number): Promise<UserStreak>;
  getStreakStats(): Promise<StreakStats>;
}


