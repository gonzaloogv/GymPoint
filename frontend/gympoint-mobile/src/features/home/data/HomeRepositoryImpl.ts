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
      // Llamar en paralelo para mejorar performance
      const [userProfile, streak] = await Promise.all([
        HomeRemote.getUserProfile(),
        HomeRemote.getStreak().catch(() => ({ value: 0 })), // Fallback si falla
      ]);

      // Mapear subscription a plan
      const plan = userProfile.subscription === 'PREMIUM' ? 'Premium' : 'Free';

      return {
        name: userProfile.name,
        plan,
        tokens: userProfile.tokens,
        streak: streak.value,
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
