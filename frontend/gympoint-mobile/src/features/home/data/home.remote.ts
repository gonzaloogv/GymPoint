import { api } from '@shared/http/apiClient';

export type FrequencyResponseDTO = {
  id_frequency: number;
  id_user: number;
  goal: number;
  assist: number;
  achieved_goal: boolean;
  week_start_date?: string | null;
  week_number?: number | null;
  year?: number | null;
};

export type UserProfileResponseDTO = {
  id: number;
  id_user_profile: number;
  name: string;
  lastname: string;
  email: string;
  subscription?: 'FREE' | 'PREMIUM';
  tokens?: number;
};

export type StreakResponseDTO = {
  id_streak: number;
  value: number;
  last_value: number | null;
  recovery_items: number;
};

export type DailyChallengeResponseDTO = {
  id_challenge: number;
  challenge_date: string;
  title: string;
  description: string;
  challenge_type: string | null;
  target_value: number;
  target_unit: string | null;
  tokens_reward: number;
  difficulty: string | null;
  progress: number;
  completed: boolean;
};

export const HomeRemote = {
  getWeeklyFrequency: async () => {
    const { data } = await api.get<FrequencyResponseDTO>('/api/frequency/me');
    return data;
  },
  getUserProfile: async () => {
    const { data } = await api.get<UserProfileResponseDTO>('/api/users/me');
    return data;
  },
  getStreak: async () => {
    const { data } = await api.get<StreakResponseDTO>('/api/streak/me');
    return data;
  },
  getDailyChallenge: async () => {
    const { data } = await api.get<{ challenge: DailyChallengeResponseDTO | null }>(
      '/api/challenges/today',
    );
    return data.challenge;
  },
};
