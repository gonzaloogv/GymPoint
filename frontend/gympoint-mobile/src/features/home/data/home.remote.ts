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
};

export const HomeRemote = {
  // Obtener meta semanal y progreso
  getWeeklyFrequency: () =>
    api.get<FrequencyResponseDTO>('/api/frequency/me').then((r) => r.data),

  // Obtener perfil del usuario (incluye tokens)
  getUserProfile: () =>
    api.get<UserProfileResponseDTO>('/api/users/me').then((r) => r.data),
};
