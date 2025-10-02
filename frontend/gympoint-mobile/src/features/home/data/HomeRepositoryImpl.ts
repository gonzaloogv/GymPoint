import { HomeRepository } from '../domain/repositories/HomeRepository';
import { HomeStats } from '../domain/entities/HomeStats';
import { WeeklyProgress } from '../domain/entities/WeeklyProgress';
import { DailyChallenge } from '../domain/entities/DailyChallenge';
import { HomeStatsDTO, WeeklyProgressDTO, DailyChallengeDTO } from './dto/HomeStatsDTO';
import {
  mapHomeStatsDTOToEntity,
  mapWeeklyProgressDTOToEntity,
  mapDailyChallengeDTOToEntity,
} from './mappers/homeStats.mapper';

export class HomeRepositoryImpl implements HomeRepository {
  private mockStats: HomeStatsDTO = {
    name: 'María Gómez',
    plan: 'Free',
    tokens: 150,
    streak: 7,
  };

  private mockProgress: WeeklyProgressDTO = {
    goal: 4,
    current: 3,
    percentage: 75,
  };

  private mockChallenge: DailyChallengeDTO = {
    id: '1',
    title: 'Completá 3 rutinas',
    description: 'Entrená 3 veces esta semana',
    reward: 50,
    completed: false,
  };

  async getHomeStats(): Promise<HomeStats> {
    return mapHomeStatsDTOToEntity(this.mockStats);
  }

  async getWeeklyProgress(): Promise<WeeklyProgress> {
    return mapWeeklyProgressDTOToEntity(this.mockProgress);
  }

  async getDailyChallenge(): Promise<DailyChallenge> {
    return mapDailyChallengeDTOToEntity(this.mockChallenge);
  }
}

