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
   * Registro de nueva cuenta
   */
  async register(params: RegisterParams) {
    const response = await AuthRemote.register({
      email: params.email,
      password: params.password,
      name: params.name,
      lastname: params.lastname,
      gender: params.gender as 'M' | 'F' | 'O' | undefined,
      locality: params.locality,
      birth_date: params.birth_date,
      frequency_goal: params.frequency_goal,
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
   * Completar onboarding para usuarios de Google OAuth
   */
  async completeOnboarding(params: CompleteOnboardingParams) {
    const response = await AuthRemote.completeOnboarding({
      frequency_goal: params.frequencyGoal,
      birth_date: params.birthDate,
      gender: params.gender,
    });

    return mapAuthUserToEntity(response.user);
  }
}
