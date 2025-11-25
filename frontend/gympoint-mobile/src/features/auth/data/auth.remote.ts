import { api } from '../../../shared/http/apiClient';
import {
  LoginRequestDTO,
  RegisterRequestDTO,
  GoogleLoginRequestDTO,
  RefreshTokenRequestDTO,
  LogoutRequestDTO,
  AuthSuccessResponseDTO,
  RefreshTokenResponseDTO,
  UserProfileResponseDTO,
  CompleteOnboardingRequestDTO,
  CompleteOnboardingResponseDTO,
} from './auth.dto';

/**
 * Auth API Client - Alineado con OpenAPI backend (lotes 1-2)
 * Base path: /api/auth
 */
export const AuthRemote = {
  /**
   * POST /api/auth/login
   * Autenticación con email y contraseña
   */
  login: (payload: LoginRequestDTO) =>
    api.post<AuthSuccessResponseDTO>('/api/auth/login', payload).then((r) => r.data),

  /**
   * POST /api/auth/register
   * Registro de nueva cuenta de usuario
   */
  register: (payload: RegisterRequestDTO) =>
    api.post<AuthSuccessResponseDTO>('/api/auth/register', payload).then((r) => r.data),

  /**
   * POST /api/auth/google
   * Login con Google OAuth
   */
  googleLogin: (payload: GoogleLoginRequestDTO) =>
    api.post<AuthSuccessResponseDTO>('/api/auth/google', payload).then((r) => r.data),

  /**
   * POST /api/auth/refresh-token
   * Renovar access token usando refresh token
   */
  refreshToken: (payload: RefreshTokenRequestDTO) =>
    api.post<RefreshTokenResponseDTO>('/api/auth/refresh-token', payload).then((r) => r.data),

  /**
   * POST /api/auth/logout
   * Revocar refresh token
   */
  logout: (payload: LogoutRequestDTO) =>
    api.post<void>('/api/auth/logout', payload).then((r) => r.data),

  /**
   * GET /api/users/me
   * Obtener perfil del usuario actual (requiere autenticación)
   */
  me: () => api.get<UserProfileResponseDTO>('/api/users/me').then((r) => r.data),

  /**
   * POST /api/auth/complete-onboarding
   * Completar onboarding para usuarios de Google OAuth
   */
  completeOnboarding: (payload: CompleteOnboardingRequestDTO) =>
    api.post<CompleteOnboardingResponseDTO>('/api/auth/complete-onboarding', payload).then((r) => r.data),
};
