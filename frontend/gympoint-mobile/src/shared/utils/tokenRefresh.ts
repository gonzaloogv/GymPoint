import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@shared/config/env';

/**
 * Helper centralizado para refrescar y persistir tokens
 *
 * IMPORTANTE: El backend implementa rotación de refresh tokens (single-use).
 * Cada llamada a /api/auth/refresh-token revoca el refresh token usado
 * y genera un nuevo par (access + refresh).
 *
 * Este helper garantiza que SIEMPRE se persistan ambos tokens en SecureStore
 * inmediatamente después de recibirlos, evitando desincronización entre
 * cliente y backend.
 *
 * @param currentRefreshToken - Refresh token actual a intercambiar
 * @returns Nuevo par de tokens
 * @throws Error si el refresh falla o el token es inválido
 */
export async function refreshAndPersistTokens(currentRefreshToken: string) {
  console.log('[tokenRefresh] Refreshing tokens...');

  // Llamar al endpoint de refresh
  const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
    refreshToken: currentRefreshToken,
  });

  if (!data?.token) {
    throw new Error('Invalid refresh response: missing access token');
  }

  // CRÍTICO: Persistir inmediatamente antes de cualquier uso
  // El backend ya revocó el refresh token viejo, por lo que debemos
  // guardar el nuevo par atómicamente para mantener sincronización
  await SecureStore.setItemAsync('gp_access', data.token);

  if (data.refreshToken) {
    await SecureStore.setItemAsync('gp_refresh', data.refreshToken);
  }

  console.log('[tokenRefresh] Tokens refreshed and persisted successfully');

  return {
    accessToken: data.token,
    refreshToken: data.refreshToken,
  };
}

/**
 * Limpia tokens del almacenamiento seguro
 * Útil en casos de error durante refresh o logout
 */
export async function clearTokens() {
  await SecureStore.deleteItemAsync('gp_access');
  await SecureStore.deleteItemAsync('gp_refresh');
  console.log('[tokenRefresh] Tokens cleared');
}
