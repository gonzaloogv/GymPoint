// src/shared/config/env.ts
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const extra = Constants.expoConfig?.extra ?? {};
const rawApiUrl = (extra.apiUrl as string | undefined) ?? process.env.EXPO_PUBLIC_API_BASE_URL;
const ANDROID_EMULATOR = 'http://10.0.2.2:3000';
const IOS_SIMULATOR = 'http://localhost:3000';
const fallbackApi = Platform.OS === 'android' ? ANDROID_EMULATOR : IOS_SIMULATOR;

export const API_BASE_URL = (rawApiUrl ?? fallbackApi).replace(/\/$/, '');

const rawRealtimeFlag = ((extra.realtimeUi as string | undefined) ?? process.env.EXPO_PUBLIC_REALTIME_UI ?? 'on')
  .toString()
  .toLowerCase();
export const REALTIME_UI_ENABLED = rawRealtimeFlag !== 'off';

const rawRealtimeUrl = (extra.realtimeUrl as string | undefined) ?? process.env.EXPO_PUBLIC_REALTIME_URL;
export const REALTIME_URL = (rawRealtimeUrl ?? API_BASE_URL).replace(/\/$/, '');

const rawRealtimeTransport =
  (extra.realtimeTransport as string | undefined) ?? process.env.EXPO_PUBLIC_REALTIME_TRANSPORT ?? 'websocket,polling';
export const REALTIME_TRANSPORTS = rawRealtimeTransport
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean);

const rawGoogleAndroidId =
  (extra.googleAndroidClientId as string | undefined) ?? process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const rawGoogleIosId =
  (extra.googleIosClientId as string | undefined) ?? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const rawGoogleWebId =
  (extra.googleWebClientId as string | undefined) ?? process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export const GOOGLE_ANDROID_CLIENT_ID = rawGoogleAndroidId?.trim() || undefined;
export const GOOGLE_IOS_CLIENT_ID = rawGoogleIosId?.trim() || undefined;
export const GOOGLE_WEB_CLIENT_ID = rawGoogleWebId?.trim() || undefined;

// Logs de configuración (solo en desarrollo)
if (__DEV__) {
  console.log('[env] API_BASE_URL:', API_BASE_URL);
  console.log('[env] REALTIME_URL:', REALTIME_URL);
  console.log('[env] REALTIME_UI_ENABLED:', REALTIME_UI_ENABLED);
  console.log('[env] GOOGLE_ANDROID_CLIENT_ID:', GOOGLE_ANDROID_CLIENT_ID ? '✓ configured' : '✗ missing');
  console.log('[env] GOOGLE_IOS_CLIENT_ID:', GOOGLE_IOS_CLIENT_ID ? '✓ configured' : '✗ missing');
  console.log('[env] GOOGLE_WEB_CLIENT_ID:', GOOGLE_WEB_CLIENT_ID ? '✓ configured' : '✗ missing');
}
