import * as SecureStore from 'expo-secure-store';
import { AuthRepository, RegisterParams, CompleteOnboardingParams } from '../domain/repositories/AuthRepository';
import { AuthRemote } from './auth.remote';
import { mapAuthUserToEntity, mapUserProfileToEntity } from './auth.mapper';

/**
 * Implementación del repositorio de autenticación
 * Alineado con OpenAPI backend (lotes 1-2)
 */
export class AuthRepositoryImpl implements AuthRepository {
  /**
   * Login con email y contraseña
   */
  async login(email: string, password: string) {
    const response = await AuthRemote.login({ email, password });

    // Guardar tokens en SecureStore usando las mismas claves que api.ts ('gp_access', 'gp_refresh')
    await SecureStore.setItemAsync('gp_access', response.tokens.accessToken);
    await SecureStore.setItemAsync('gp_refresh', response.tokens.refreshToken);

    return {
      user: mapAuthUserToEntity(response.user),
      accessToken: response.tokens.accessToken,
      refreshToken: response.tokens.refreshToken,
    };
  }

  /**
   * Login con Google OAuth (usa idToken provisto por Google)
   */
  async loginWithGoogle(idToken: string) {
    const response = await AuthRemote.googleLogin({ idToken });

    await SecureStore.setItemAsync('gp_access', response.tokens.accessToken);
    await SecureStore.setItemAsync('gp_refresh', response.tokens.refreshToken);

    return {
      user: mapAuthUserToEntity(response.user),
      accessToken: response.tokens.accessToken,
      refreshToken: response.tokens.refreshToken,
      needsOnboarding: response.needsOnboarding ?? false,
    };
  }

  /**
   * Obtener perfil del usuario actual
   */
  async me() {
    const profile = await AuthRemote.me();
    return mapUserProfileToEntity(profile);
  }

  /**
   * Logout - revocar tokens
   */
  async logout() {
    try {
      const refreshToken = await SecureStore.getItemAsync('gp_refresh');
      if (refreshToken) {
        // Intentar revocar el token en el backend
        await AuthRemote.logout({ refreshToken });
      }
    } catch (error) {
      console.warn('Error al revocar refresh token:', error);
    } finally {
      // Siempre eliminar tokens locales
      await SecureStore.deleteItemAsync('gp_access');
      await SecureStore.deleteItemAsync('gp_refresh');
    }
  }

  /**
   * Registro de nueva cuenta (Onboarding fase 1)
   * Solo envía campos básicos. Los campos de perfil se completan en /complete-onboarding
   */
  async register(params: RegisterParams) {
    const response = await AuthRemote.register({
      email: params.email,
      password: params.password,
      name: params.name,
      lastname: params.lastname,
      // Onboarding 2 fases: NO enviar campos de fase 2 en registro
      // Backend usará defaults: gender='O', locality=null, birth_date=null, frequency_goal=3
    });

    // Guardar tokens en SecureStore usando las mismas claves que api.ts ('gp_access', 'gp_refresh')
    await SecureStore.setItemAsync('gp_access', response.tokens.accessToken);
    await SecureStore.setItemAsync('gp_refresh', response.tokens.refreshToken);

    return {
      user: mapAuthUserToEntity(response.user),
      accessToken: response.tokens.accessToken,
      refreshToken: response.tokens.refreshToken,
    };
  }

  /**
   * Completar onboarding para usuarios (local y Google OAuth)
   */
  async completeOnboarding(params: CompleteOnboardingParams) {
    console.log('📤 [ONBOARDING] Enviando:', {
      frequency_goal: params.frequencyGoal,
      birth_date: params.birthDate,
      gender: params.gender,
    });

    try {
      const response = await AuthRemote.completeOnboarding({
        frequency_goal: params.frequencyGoal,
        birth_date: params.birthDate,
        gender: params.gender,
      });

      console.log('✅ [ONBOARDING] Respuesta exitosa:', response);
      return mapAuthUserToEntity(response.user);
    } catch (error: any) {
      console.error('❌ [ONBOARDING] Error en repositorio:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      throw error;
    }
  }
}
