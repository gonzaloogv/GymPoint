import * as SecureStore from 'expo-secure-store';
import { AuthRepository, RegisterParams } from '../domain/repositories/AuthRepository';
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

    // Guardar tokens en SecureStore
    await SecureStore.setItemAsync('accessToken', response.tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', response.tokens.refreshToken);

    return {
      user: mapAuthUserToEntity(response.user),
      accessToken: response.tokens.accessToken,
      refreshToken: response.tokens.refreshToken,
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
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) {
        // Intentar revocar el token en el backend
        await AuthRemote.logout({ refreshToken });
      }
    } catch (error) {
      console.warn('Error al revocar refresh token:', error);
    } finally {
      // Siempre eliminar tokens locales
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
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

    // Guardar tokens en SecureStore
    await SecureStore.setItemAsync('accessToken', response.tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', response.tokens.refreshToken);

    return {
      user: mapAuthUserToEntity(response.user),
      accessToken: response.tokens.accessToken,
      refreshToken: response.tokens.refreshToken,
    };
  }
}
