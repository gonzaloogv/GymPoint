import { HomeStats } from '../entities/HomeStats';
import { WeeklyProgress } from '../entities/WeeklyProgress';
import { DailyChallenge } from '../entities/DailyChallenge';

export interface HomeRepository {
  getHomeStats(): Promise<HomeStats>;
  getWeeklyProgress(): Promise<WeeklyProgress>;
  getDailyChallenge(): Promise<DailyChallenge>;
}
