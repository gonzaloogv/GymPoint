import { api } from '@shared/http/apiClient';

// DTOs que coinciden con la respuesta del backend
export type FrequencyResponseDTO = {
  id_frequency: number;
  id_user: number;
  goal: number;
  assist: number;
  achieved_goal: boolean;
  userProfile?: {
  name: string;
  lastname: string;
  };
};

export type UserProfileResponseDTO = {
  id_user: number;
  name: string;
  lastname: string;
  email: string;
  gender: string;
  locality: string;
  birth_date: string | null;
  role: string;
  tokens: number;
  subscription?: 'FREE' | 'PREMIUM';
};

export type StreakResponseDTO = {
  id_streak: number;
  value: number;
  last_value: number;
  recovery_items: number;
  user?: {
    id_user_profile: number;
    name: string;
    lastname: string;
  };
  frequency?: {
    goal: number;
    assist: number;
    achieved_goal: boolean;
  };
};

export const HomeRemote = {
  // Obtener meta semanal y progreso
  getWeeklyFrequency: () =>
    api.get<FrequencyResponseDTO>('/api/frequency/me').then((r) => r.data),

  // Obtener perfil del usuario (incluye tokens y subscription)
  getUserProfile: () =>
    api.get<UserProfileResponseDTO>('/api/users/me').then((r) => r.data),

  // Obtener racha actual del usuario
  getStreak: () =>
    api.get<StreakResponseDTO>('/api/streak/me').then((r) => r.data),
};
