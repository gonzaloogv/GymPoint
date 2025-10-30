/**
 * Assistance API DTOs
 * Tipos alineados con el backend de assistance
 */

/**
 * Request para hacer check-in
 * POST /api/assistances
 */
export interface CheckInRequestDTO {
  id_gym: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/**
 * Response de check-in exitoso
 */
export interface CheckInResponseDTO {
  message: string;
  data: {
    id_assistance: number;
    id_user_profile: number;
    id_gym: number;
    entry_time: string; // ISO date
    latitude: number;
    longitude: number;
    accuracy: number | null;
    gym?: {
      id_gym: number;
      name: string;
      address: string;
      city: string;
    };
  };
}

/**
 * Asistencia desde el backend
 */
export interface AssistanceDTO {
  id_assistance: number;
  id_user_profile: number;
  id_gym: number;
  entry_time: string; // ISO date
  exit_time: string | null; // ISO date or null
  latitude: number;
  longitude: number;
  accuracy: number | null;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
  gym?: {
    id_gym: number;
    name: string;
    address: string;
    city: string;
    profile_image_url: string | null;
  };
}

/**
 * Response de historial de asistencias
 * GET /api/assistances/me
 */
export interface AssistanceHistoryResponseDTO {
  data: AssistanceDTO[];
}

/**
 * Error de check-in
 */
export interface CheckInError {
  error: {
    code: 'OUT_OF_RANGE' | 'GPS_INACCURATE' | 'SUBSCRIPTION_REQUIRED' | 'ASSISTANCE_REGISTRATION_FAILED' | 'MISSING_FIELDS';
    message: string;
  };
}

/**
 * Response de verificación de check-in del día
 * GET /api/assistances/today-status
 */
export interface TodayStatusResponseDTO {
  has_checked_in_today: boolean;
  assistance: {
    id_assistance: number;
    id_gym: number;
    check_in_time: string; // Hora en formato HH:MM:SS
    date: string; // Fecha en formato YYYY-MM-DD
    gym_name: string | null;
    created_at?: string; // Timestamp completo con timezone
  } | null;
}
