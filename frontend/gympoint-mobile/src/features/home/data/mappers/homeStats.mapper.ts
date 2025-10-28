import { HomeStats } from '../../domain/entities/HomeStats';
import { WeeklyProgress } from '../../domain/entities/WeeklyProgress';
import { DailyChallenge } from '../../domain/entities/DailyChallenge';
import {
  DailyChallengeDTO,
  FrequencyDTO,
  StreakDTO,
  UserProfileDTO,
} from '../dto/HomeStatsDTO';

export const mapHomeStatsDTOToEntity = (
  profile: UserProfileDTO,
  streak?: StreakDTO | null,
): HomeStats => {
  const fullName = [profile.name, profile.lastname].filter(Boolean).join(' ').trim();
  return {
    name: fullName || profile.name || profile.lastname || 'Usuario',
    plan: profile.subscription === 'PREMIUM' ? 'Premium' : 'Free',
    tokens: profile.tokens ?? 0,
    streak: streak?.value ?? 0,
  };
};

export const mapWeeklyProgressDTOToEntity = (dto: FrequencyDTO): WeeklyProgress => {
  const goal = dto.goal ?? 0;
  const current = dto.assist ?? 0;
  const percentage = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
  return {
    goal,
    current,
    percentage,
  };
};

export const mapDailyChallengeDTOToEntity = (dto: DailyChallengeDTO): DailyChallenge => ({
  id: dto.id,
  title: dto.title,
  description: dto.description,
  reward: dto.reward,
  progress: dto.progress,
  target: dto.target,
  unit: dto.unit ?? undefined,
  completed: dto.completed,
  challengeType: dto.challengeType ?? undefined,
  date: dto.date ?? undefined,
});
