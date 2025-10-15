import { api } from '@shared/http/apiClient';

// Reutilizar los DTOs de home para evitar duplicación
import type { UserProfileResponseDTO, StreakResponseDTO } from '@features/home/data/home.remote';

export { UserProfileResponseDTO, StreakResponseDTO };

export const UserRemote = {
  // Obtener perfil completo del usuario
  getUserProfile: () =>
    api.get<UserProfileResponseDTO>('/api/users/me').then((r) => r.data),

  // Obtener racha del usuario
  getStreak: () =>
    api.get<StreakResponseDTO>('/api/streak/me').then((r) => r.data),

  // Actualizar perfil del usuario
  updateProfile: (data: Partial<UserProfileResponseDTO>) =>
    api.put<UserProfileResponseDTO>('/api/users/me', data).then((r) => r.data),
};
