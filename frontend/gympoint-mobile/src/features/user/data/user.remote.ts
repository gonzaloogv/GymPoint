import { api } from '@shared/http/apiClient';
import {
  UserProfileResponseDTO,
  UpdateUserProfileRequestDTO,
  UpdateEmailRequestDTO,
  EmailUpdateResponseDTO,
  RequestAccountDeletionRequestDTO,
  AccountDeletionResponseDTO,
  AccountDeletionStatusResponseDTO,
  NotificationSettingsResponseDTO,
  UpdateNotificationSettingsRequestDTO,
} from '../../auth/data/auth.dto';
import { FrequencyResponseDTO, UpdateWeeklyFrequencyRequestDTO } from './dto/user.dto';

// Re-export para compatibilidad
export type { UserProfileResponseDTO };

/**
 * Users API Client - Alineado con OpenAPI backend (lote 2)
 * Base path: /api/users
 */
export const UserRemote = {
  /**
   * GET /api/users/me
   * Obtener perfil del usuario actual
   */
  getProfile: () =>
    api.get<UserProfileResponseDTO>('/api/users/me').then((r) => r.data),

  /**
   * Alias para compatibilidad con código existente
   */
  getUserProfile: () =>
    api.get<UserProfileResponseDTO>('/api/users/me').then((r) => r.data),

  /**
   * PUT /api/users/me
   * Actualizar perfil del usuario actual
   */
  updateProfile: (payload: UpdateUserProfileRequestDTO) =>
    api.put<UserProfileResponseDTO>('/api/users/me', payload).then((r) => r.data),

  /**
   * DELETE /api/users/me
   * Solicitar eliminación de cuenta
   */
  requestAccountDeletion: (payload?: RequestAccountDeletionRequestDTO) => {
    const config = payload
      ? { data: payload, headers: { 'Content-Type': 'application/json' } }
      : {};
    return api.delete<AccountDeletionResponseDTO>('/api/users/me', config).then((r) => r.data);
  },

  /**
   * PUT /api/users/me/email
   * Actualizar email del usuario
   */
  updateEmail: (payload: UpdateEmailRequestDTO) =>
    api.put<EmailUpdateResponseDTO>('/api/users/me/email', payload).then((r) => r.data),

  /**
   * GET /api/users/me/deletion-request
   * Obtener estado de solicitud de eliminación
   */
  getAccountDeletionStatus: () =>
    api.get<AccountDeletionStatusResponseDTO>('/api/users/me/deletion-request').then((r) => r.data),

  /**
   * DELETE /api/users/me/deletion-request
   * Cancelar solicitud de eliminación
   */
  cancelAccountDeletion: () =>
    api.delete<AccountDeletionResponseDTO>('/api/users/me/deletion-request').then((r) => r.data),

  /**
   * GET /api/users/me/notifications/settings
   * Obtener configuración de notificaciones
   */
  getNotificationSettings: () =>
    api.get<NotificationSettingsResponseDTO>('/api/users/me/notifications/settings').then((r) => r.data),

  /**
   * PUT /api/users/me/notifications/settings
   * Actualizar configuración de notificaciones
   */
  updateNotificationSettings: (payload: UpdateNotificationSettingsRequestDTO) =>
    api.put<NotificationSettingsResponseDTO>('/api/users/me/notifications/settings', payload).then((r) => r.data),

  /**
   * GET /api/users/{userId}
   * Obtener perfil de usuario por ID (admin)
   */
  getUserById: (userId: number) =>
    api.get<UserProfileResponseDTO>(`/api/users/${userId}`).then((r) => r.data),

  /**
   * GET /api/frequency/me
   * Obtener frecuencia semanal del usuario actual
   */
  getWeeklyFrequency: () =>
    api.get<FrequencyResponseDTO>('/api/frequency/me').then((r) => r.data),

  /**
   * POST /api/frequency
   * Actualizar frecuencia semanal (cambio se aplica el próximo lunes)
   */
  updateWeeklyFrequency: (payload: UpdateWeeklyFrequencyRequestDTO) =>
    api.post<FrequencyResponseDTO>('/api/frequency', payload).then((r) => r.data),
};
