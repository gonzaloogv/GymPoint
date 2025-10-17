import { DailyChallenge, ChallengeStats } from '../entities';

export interface DailyChallengeRepository {
  getAllChallenges(): Promise<DailyChallenge[]>;
  getChallengeStats(): Promise<ChallengeStats>;
}


