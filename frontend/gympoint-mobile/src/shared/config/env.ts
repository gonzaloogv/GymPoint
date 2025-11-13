// src/shared/config/env.ts
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Si existe en app.config.ts → extra.apiUrl
const extraUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;

// Fallbacks sensatos si no hay variable
const ANDROID_EMULATOR = 'http://10.0.2.2:3000';
const IOS_SIMULATOR = 'http://localhost:3000';

// Detectar si estamos corriendo en Expo Go vs. build nativo
// executionEnvironment: 'storeClient' = Expo Go, 'standalone' = build nativo
const isExpoGo = Constants.executionEnvironment === 'storeClient';

/**
 * Resuelve la URL del API considerando el entorno de ejecución
 *
 * IMPORTANTE: Expo Go vs Builds Nativos
 *
 * Expo Go (appOwnership === 'expo'):
 *   - Tanto iOS como Android pueden acceder a IPs locales (192.168.x.x)
 *   - Usa la misma red WiFi que la máquina host
 *   - Debe usar la URL del .env
 *
 * Build Nativo en Emulador Android:
 *   - NO puede acceder a 192.168.x.x (red virtual separada)
 *   - Debe usar 10.0.2.2 para acceder al localhost del host
 *
 * Solución:
 *   1. Si hay URL en .env, SIEMPRE usarla (funciona en Expo Go)
 *   2. Si NO hay URL y es Android, usar 10.0.2.2 (build nativo)
 *   3. Si NO hay URL y es iOS, usar localhost
 */
const resolveApiUrl = (): string => {
  // PRIORIDAD 1: Si hay una URL configurada (de .env), usarla
  // Esto funciona en Expo Go para ambas plataformas
  if (extraUrl) {
    console.log('📱 Usando URL del .env:', extraUrl);
    return extraUrl;
  }

  // PRIORIDAD 2: Fallback por plataforma (solo cuando NO hay .env)
  const fallback = Platform.OS === 'android' ? ANDROID_EMULATOR : IOS_SIMULATOR;
  console.log(`📱 No hay .env, usando fallback para ${Platform.OS}:`, fallback);
  return fallback;
};

export const API_BASE_URL = resolveApiUrl();

// Logging detallado para debugging (solo en desarrollo)
if (__DEV__) {
  console.log('🌐 ========== API CONFIG ==========');
  console.log('🌐 API_BASE_URL:', API_BASE_URL);
  console.log('🌐 Platform:', Platform.OS);
  console.log('🌐 Execution Environment:', Constants.executionEnvironment);
  console.log('🌐 Is Expo Go:', isExpoGo);
  console.log('🌐 Extra URL from .env:', extraUrl);
  console.log('🌐 ==================================');
}
