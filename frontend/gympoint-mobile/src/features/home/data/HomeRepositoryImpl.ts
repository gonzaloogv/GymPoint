import { HomeRepository } from '../domain/repositories/HomeRepository';
import { HomeStats } from '../domain/entities/HomeStats';
import { WeeklyProgress } from '../domain/entities/WeeklyProgress';
import { DailyChallenge } from '../domain/entities/DailyChallenge';
import { DailyChallengeDTO } from './dto/HomeStatsDTO';
import { mapDailyChallengeDTOToEntity } from './mappers/homeStats.mapper';
import { HomeRemote } from './home.remote';

export class HomeRepositoryImpl implements HomeRepository {
  private mockChallenge: DailyChallengeDTO = {
    id: '1',
    title: 'Completá 3 rutinas',
    description: 'Entrená 3 veces esta semana',
    reward: 50,
    completed: false,
  };

  async getHomeStats(): Promise<HomeStats> {
    try {
      const userProfile = await HomeRemote.getUserProfile();

      return {
        name: userProfile.name,
        plan: 'Free', // TODO: Mapear desde subscription cuando esté disponible
        tokens: userProfile.tokens,
        streak: 0, // TODO: Obtener desde endpoint de streak cuando esté disponible
      };
    } catch (error) {
      console.error('Error fetching home stats:', error);
      // Fallback a datos vacíos
      return {
        name: '',
        plan: 'Free',
        tokens: 0,
        streak: 0,
      };
    }
  }

  async getWeeklyProgress(): Promise<WeeklyProgress> {
    try {
      const frequency = await HomeRemote.getWeeklyFrequency();
      const percentage = frequency.goal > 0
        ? Math.round((frequency.assist / frequency.goal) * 100)
        : 0;

      return {
        goal: frequency.goal,
        current: frequency.assist,
        percentage,
      };
    } catch (error) {
      console.error('Error fetching weekly progress:', error);
      // Fallback a datos vacíos
      return {
        goal: 0,
        current: 0,
        percentage: 0,
      };
    }
  }

  async getDailyChallenge(): Promise<DailyChallenge> {
    // Por ahora mantenemos el mock hasta que exista el endpoint
    return mapDailyChallengeDTOToEntity(this.mockChallenge);
  }
}
