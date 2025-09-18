// src/config/env.ts
import Constants from 'expo-constants';

export const API_BASE_URL =
  (Constants.expoConfig?.extra?.apiUrl as string) ?? 'http://localhost:3000';

console.log('🌐 API_BASE_URL:', API_BASE_URL);
