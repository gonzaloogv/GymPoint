// src/config/env.ts
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Si existe en app.config.ts → extra.apiUrl
const extraUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;

// Fallbacks sensatos si no hay variable
const ANDROID_EMULATOR = 'http://10.0.2.2:3000';
const IOS_SIMULATOR = 'http://localhost:3000';

// Si no seteaste EXPO_PUBLIC_API_BASE_URL, elige por plataforma
const fallback =
  Platform.OS === 'android' ? ANDROID_EMULATOR : IOS_SIMULATOR;

export const API_BASE_URL = extraUrl ?? fallback;

console.log('🌐 API_BASE_URL:', API_BASE_URL);

console.log('🌐 API_BASE_URL:', API_BASE_URL || api.defaults.baseURL);
