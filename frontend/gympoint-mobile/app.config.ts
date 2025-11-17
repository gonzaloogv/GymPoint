// app.config.ts
import { config as dotenvConfig } from 'dotenv';
import { expand } from 'dotenv-expand';
import type { ExpoConfig } from '@expo/config';

// Cargar el archivo .env correcto según el entorno
const APP_ENV = process.env.APP_ENV || 'development';
const envFile = APP_ENV === 'production' ? '.env.production' : '.env.development';

// eslint-disable-next-line no-console
console.log(`[app.config] Loading environment from: ${envFile}`);
// Forzar que APP_ENV seleccionado sobrescriba lo que Expo cargue por defecto (.env, .env.development)
expand(dotenvConfig({ path: envFile, override: true }));

// ✅ Construir el Google scheme dinámicamente desde la variable de entorno
const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';
const googleScheme = androidClientId
  ? `com.googleusercontent.apps.${androidClientId.replace('.apps.googleusercontent.com', '')}`
  : '';

// ✅ Guard: Validar que el Client ID existe en producción
if (!googleScheme && APP_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.warn(
    '[app.config] ⚠️ EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID no está configurado. ' +
    'El redirect de Google OAuth fallará en producción.'
  );
}

// ✅ Configurar intent-filters solo si hay scheme válido
const androidIntentFilters = googleScheme
  ? [
      {
        action: 'VIEW',
        data: [
          {
            scheme: googleScheme,
            host: 'oauth2redirect',
            // pathPrefix omitido intencionalmente - Google generalmente NO lo envía
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ]
  : [];

const config: ExpoConfig = {
  name: 'GymPoint',
  slug: 'gympoint-mobile',
  owner: 'gympoint',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icons/logo.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/icons/logo.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'ien.gympoint.mobile',
  },
  scheme: 'ien.gympoint.mobile',
  android: {
    package: 'ien.gympoint.mobile',
    versionCode: 1,
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    adaptiveIcon: {
      foregroundImage: './assets/icons/logo-nobg.png',
      backgroundColor: '#4A9CF5',
    },
    config: {
      googleMaps: {
        apiKey: process.env.ANDROID_GOOGLE_MAPS_API_KEY,
      },
    },
    // ✅ Intent-filter para Google OAuth redirect (solo si googleScheme existe)
    intentFilters: androidIntentFilters,
  },
  web: {
    favicon: './assets/icons/logo.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-secure-store',
    'expo-web-browser',
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    realtimeUrl: process.env.EXPO_PUBLIC_REALTIME_URL,
    realtimeUi: process.env.EXPO_PUBLIC_REALTIME_UI,
    realtimeTransport: process.env.EXPO_PUBLIC_REALTIME_TRANSPORT,
    googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    eas: {
      projectId: 'd32934e5-0017-4404-937a-53d8c31550a2',
    },
  },
};

export default config;


