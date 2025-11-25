/**
 * Subscription API DTOs
 * Tipos alineados con OpenAPI backend
 */

export type SubscriptionPlan = 'MENSUAL' | 'SEMANAL' | 'ANUAL';

/**
 * DTO de suscripción desde el backend
 */
export interface UserGymSubscriptionDTO {
  id_user_gym: number;
  id_user_profile: number;
  id_gym: number;
  subscription_plan: SubscriptionPlan;
  subscription_start: string; // ISO date
  subscription_end: string; // ISO date
  is_active: boolean;
  trial_used: boolean;
  trial_date: string | null; // ISO date or null
  created_at: string;
  updated_at: string;
  // Datos del gimnasio (cuando se incluye)
  gym?: {
    id_gym: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    profile_image_url: string | null;
    trial_allowed: boolean;
  };
}

/**
 * Request para suscribirse a un gimnasio
 * POST /api/user-gym/alta
 */
export interface SubscribeToGymRequestDTO {
  id_gym: number;
  plan: SubscriptionPlan;
  subscription_start?: string; // ISO date - Opcional para pago manual/externo
  subscription_end?: string;   // ISO date - Opcional para pago manual/externo
}

/**
 * Request para cancelar suscripción
 * PUT /api/user-gym/baja
 */
export interface UnsubscribeFromGymRequestDTO {
  id_gym: number;
}

/**
 * Response de alta en gimnasio
 */
export interface SubscribeToGymResponseDTO {
  message: string;
  data: UserGymSubscriptionDTO;
}

/**
 * Response de gimnasios activos
 * GET /api/user-gym/me/activos
 */
export interface ActiveSubscriptionsResponseDTO {
  data: UserGymSubscriptionDTO[];
}

/**
 * Response de historial de suscripciones
 * GET /api/user-gym/me/historial
 */
export interface SubscriptionHistoryResponseDTO {
  data: {
    items: UserGymSubscriptionDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Query params para historial
 */
export interface SubscriptionHistoryQueryParams {
  active?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Error de validación de suscripción
 */
export interface SubscriptionValidationError {
  error: {
    code: 'SUBSCRIPTION_REQUIRED' | 'TRIAL_USED' | 'VALIDATION_ERROR' | 'ALTA_FAILED';
    message: string;
    gymId?: number;
    gymName?: string;
    trialUsed?: boolean;
  };
}
