// app.config.ts
import 'dotenv/config';
import type { ExpoConfig } from '@expo/config';

const config: ExpoConfig = {
  name: 'gympoint-mobile',
  slug: 'gympoint-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    package: 'ien.gympoint.mobile',
    versionCode: 1,
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    config: {
      googleMaps: {
        apiKey: process.env.ANDROID_GOOGLE_MAPS_API_KEY,
      },
    },
  },
  web: {
    favicon: './assets/favicon.png',
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
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    eas: {
      projectId: '90783b9f-cf53-4464-9311-0b3e237ca318',
    },
  },
};

export default config;


