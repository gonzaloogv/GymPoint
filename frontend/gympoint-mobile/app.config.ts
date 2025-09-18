// app.config.ts
import 'dotenv/config';
import type { ExpoConfig } from '@expo/config';

const config: ExpoConfig = {
  name: 'gympoint-mobile',
  slug: 'gympoint-mobile',
  version: '1.0.0',
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  },
};

export default config;
