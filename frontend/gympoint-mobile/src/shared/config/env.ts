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

console.log('[env] API_BASE_URL:', API_BASE_URL);
console.log('[env] REALTIME_URL:', REALTIME_URL);
console.log('[env] REALTIME_UI_ENABLED:', REALTIME_UI_ENABLED);
