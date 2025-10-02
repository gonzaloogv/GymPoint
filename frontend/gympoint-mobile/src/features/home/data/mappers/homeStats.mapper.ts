import { HomeStats } from '../../domain/entities/HomeStats';
import { WeeklyProgress } from '../../domain/entities/WeeklyProgress';
import { DailyChallenge } from '../../domain/entities/DailyChallenge';
import { HomeStatsDTO, WeeklyProgressDTO, DailyChallengeDTO } from '../dto/HomeStatsDTO';

export const mapHomeStatsDTOToEntity = (dto: HomeStatsDTO): HomeStats => ({
  name: dto.name,
  plan: dto.plan,
  tokens: dto.tokens,
  streak: dto.streak,
});

export const mapWeeklyProgressDTOToEntity = (dto: WeeklyProgressDTO): WeeklyProgress => ({
  goal: dto.goal,
  current: dto.current,
  percentage: dto.percentage,
});

export const mapDailyChallengeDTOToEntity = (dto: DailyChallengeDTO): DailyChallenge => ({
  id: dto.id,
  title: dto.title,
  description: dto.description,
  reward: dto.reward,
  completed: dto.completed,
});

