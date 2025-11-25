import { api } from '../../../shared/http/apiClient';
import {
  CheckInRequestDTO,
  CheckInResponseDTO,
  AssistanceHistoryResponseDTO,
  TodayStatusResponseDTO,
} from './dto/assistance.api.dto';

/**
 * Assistance API Client
 * Base path: /api/assistances
 */
export const AssistanceRemote = {
  /**
   * POST /api/assistances
   * Registrar check-in en un gimnasio
   */
  checkIn: (payload: CheckInRequestDTO) =>
    api
      .post<CheckInResponseDTO>('/api/assistances', payload)
      .then((r) => {
        console.log('📥 [AssistanceRemote] Respuesta de check-in:', JSON.stringify(r.data, null, 2));
        return r.data;
      }),

  /**
   * GET /api/assistances/me
   * Obtener historial de asistencias del usuario
   */
  getHistory: () =>
    api
      .get<AssistanceHistoryResponseDTO>('/api/assistances/me')
      .then((r) => r.data),

  /**
   * GET /api/assistances/today-status
   * Verificar si el usuario ya hizo check-in hoy
   */
  getTodayStatus: () =>
    api
      .get<TodayStatusResponseDTO>('/api/assistances/today-status')
      .then((r) => r.data),
};
