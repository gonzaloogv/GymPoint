import { api } from '../../../shared/http/apiClient';
import {
  SubscribeToGymRequestDTO,
  SubscribeToGymResponseDTO,
  UnsubscribeFromGymRequestDTO,
  ActiveSubscriptionsResponseDTO,
  SubscriptionHistoryResponseDTO,
  SubscriptionHistoryQueryParams,
} from './dto/subscription.api.dto';

/**
 * Subscriptions API Client
 * Base path: /api/user-gym
 */
export const SubscriptionRemote = {
  /**
   * POST /api/user-gym/alta
   * Suscribirse a un gimnasio
   */
  subscribe: (payload: SubscribeToGymRequestDTO) => {
    console.log('📤 [SubscriptionRemote.subscribe] Payload enviado:', JSON.stringify(payload, null, 2));
    console.log('📤 [SubscriptionRemote.subscribe] Tipo de id_gym:', typeof payload.id_gym, 'Valor:', payload.id_gym);
    return api
      .post<SubscribeToGymResponseDTO>('/api/user-gym/alta', payload)
      .then((r) => r.data);
  },

  /**
   * PUT /api/user-gym/baja
   * Cancelar suscripción a un gimnasio
   */
  unsubscribe: (payload: UnsubscribeFromGymRequestDTO) =>
    api
      .put<{ message: string }>('/api/user-gym/baja', payload)
      .then((r) => r.data),

  /**
   * GET /api/user-gym/me/activos
   * Obtener gimnasios activos del usuario
   */
  getActiveSubscriptions: () =>
    api
      .get<ActiveSubscriptionsResponseDTO>('/api/user-gym/me/activos')
      .then((r) => {
        console.log('📥 [SubscriptionRemote] Respuesta de /api/user-gym/me/activos:', JSON.stringify(r.data, null, 2));
        return r.data;
      }),

  /**
   * GET /api/user-gym/me/historial
   * Obtener historial de suscripciones
   */
  getHistory: (params?: SubscriptionHistoryQueryParams) =>
    api
      .get<SubscriptionHistoryResponseDTO>('/api/user-gym/me/historial', {
        params,
      })
      .then((r) => r.data),

  /**
   * GET /api/user-gym/gimnasio/{id_gym}/conteo
   * Obtener cantidad de usuarios activos en un gimnasio
   */
  getGymMembersCount: (gymId: number) =>
    api
      .get<{ count: number }>(`/api/user-gym/gimnasio/${gymId}/conteo`)
      .then((r) => r.data),
};
