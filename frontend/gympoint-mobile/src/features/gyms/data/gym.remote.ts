import { api } from '../../../shared/http/apiClient';
import {
  GymResponseDTO,
  GymListResponseDTO,
  GymAmenityDTO,
  GymTypeListDTO,
  GymListQueryParams,
  CreateGymRequestDTO,
  UpdateGymRequestDTO,
} from './dto/GymApiDTO';

/**
 * Gyms API Client - Alineado con OpenAPI backend (lote 3)
 * Base path: /api/gyms
 */
export const GymRemote = {
  /**
   * GET /api/gyms
   * Listar gimnasios con paginación y filtros
   */
  list: (params?: GymListQueryParams) =>
    api.get<GymListResponseDTO>('/api/gyms', { params }).then((r) => r.data),

  /**
   * GET /api/gyms/{gymId}
   * Obtener detalle de un gimnasio
   */
  getById: (gymId: number) =>
    api.get<GymResponseDTO>(`/api/gyms/${gymId}`).then((r) => r.data),

  /**
   * POST /api/gyms
   * Crear un gimnasio (requiere autenticación)
   */
  create: (payload: CreateGymRequestDTO) =>
    api.post<GymResponseDTO>('/api/gyms', payload).then((r) => r.data),

  /**
   * PUT /api/gyms/{gymId}
   * Actualizar un gimnasio (requiere autenticación)
   */
  update: (gymId: number, payload: UpdateGymRequestDTO) =>
    api.put<GymResponseDTO>(`/api/gyms/${gymId}`, payload).then((r) => r.data),

  /**
   * DELETE /api/gyms/{gymId}
   * Eliminar un gimnasio (requiere autenticación)
   */
  delete: (gymId: number) =>
    api.delete<void>(`/api/gyms/${gymId}`).then((r) => r.data),

  /**
   * GET /api/gyms/tipos
   * Listar tipos de gimnasios
   */
  listTypes: () =>
    api.get<GymTypeListDTO>('/api/gyms/tipos').then((r) => r.data),

  /**
   * GET /api/gyms/amenidades
   * Listar amenities disponibles
   */
  listAmenities: () =>
    api.get<GymAmenityDTO[]>('/api/gyms/amenidades').then((r) => r.data),

  /**
   * Legacy: GET /api/gyms/cercanos (mantener para compatibilidad)
   * @deprecated Usar list() con parámetros de filtro en su lugar
   */
  listNearby: (lat: number, lng: number, radiusKm: number) =>
    api.get('/api/gyms/cercanos', { params: { lat, lng, radiusKm } }).then((r) => r.data),
};
