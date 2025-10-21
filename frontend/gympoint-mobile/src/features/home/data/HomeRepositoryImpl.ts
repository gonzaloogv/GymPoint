import { HomeRepository } from '../domain/repositories/HomeRepository';
import { HomeStats } from '../domain/entities/HomeStats';
import { WeeklyProgress } from '../domain/entities/WeeklyProgress';
import { DailyChallenge } from '../domain/entities/DailyChallenge';
import {
  DailyChallengeDTO,
  FrequencyDTO,
  StreakDTO,
  UserProfileDTO,
} from './dto/HomeStatsDTO';
import {
  mapDailyChallengeDTOToEntity,
  mapHomeStatsDTOToEntity,
  mapWeeklyProgressDTOToEntity,
} from './mappers/homeStats.mapper';
import {
  DailyChallengeResponseDTO,
  FrequencyResponseDTO,
  HomeRemote,
  StreakResponseDTO,
  UserProfileResponseDTO,
} from './home.remote';

const mapProfileResponseToDTO = (profile: UserProfileResponseDTO): UserProfileDTO => ({
  id_user_profile: profile.id_user_profile ?? profile.id,
  name: profile.name,
  lastname: profile.lastname,
  email: profile.email,
  tokens: profile.tokens ?? 0,
  subscription: profile.subscription,
});

const mapStreakResponseToDTO = (streak: StreakResponseDTO): StreakDTO => ({
  id_streak: streak.id_streak,
  value: streak.value ?? 0,
  last_value: streak.last_value ?? null,
  recovery_items: streak.recovery_items ?? 0,
});

const mapFrequencyResponseToDTO = (frequency: FrequencyResponseDTO): FrequencyDTO => ({
  id_frequency: frequency.id_frequency,
  id_user: frequency.id_user,
  goal: frequency.goal ?? 0,
  assist: frequency.assist ?? 0,
  achieved_goal: !!frequency.achieved_goal,
});

const mapChallengeResponseToDTO = (
  challenge: DailyChallengeResponseDTO,
): DailyChallengeDTO => ({
  id: String(challenge.id_challenge),
  title: challenge.title,
  description: challenge.description,
  reward: challenge.tokens_reward,
  progress: challenge.progress ?? 0,
  target: challenge.target_value ?? 0,
  unit: challenge.target_unit,
  completed: !!challenge.completed,
  challengeType: challenge.challenge_type,
  date: challenge.challenge_date,
});

export class HomeRepositoryImpl implements HomeRepository {
  async getHomeStats(): Promise<HomeStats> {
    const [profileResponse, streakResponse] = await Promise.all([
      HomeRemote.getUserProfile(),
      HomeRemote.getStreak().catch((error: any) => {
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }),
    ]);

    const profileDTO = mapProfileResponseToDTO(profileResponse);
    const streakDTO = streakResponse ? mapStreakResponseToDTO(streakResponse) : null;

    return mapHomeStatsDTOToEntity(profileDTO, streakDTO);
  }

  async getWeeklyProgress(): Promise<WeeklyProgress> {
    try {
      const frequencyResponse = await HomeRemote.getWeeklyFrequency();
      const frequencyDTO = mapFrequencyResponseToDTO(frequencyResponse);
      return mapWeeklyProgressDTOToEntity(frequencyDTO);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return mapWeeklyProgressDTOToEntity({
          id_frequency: -1,
          id_user: -1,
          goal: 0,
          assist: 0,
          achieved_goal: false,
        });
      }
      throw error;
    }
  }

  async getDailyChallenge(): Promise<DailyChallenge | null> {
    try {
      const challengeResponse = await HomeRemote.getDailyChallenge();
      if (!challengeResponse) {
        return null;
      }
      const challengeDTO = mapChallengeResponseToDTO(challengeResponse);
      return mapDailyChallengeDTOToEntity(challengeDTO);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}
