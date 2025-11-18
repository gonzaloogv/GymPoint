import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';

import { GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '@shared/config/env';
import { DI } from '@di/container';
import { useAuthStore } from '../state/auth.store';
import { User } from '../../domain/entities/User';

/**
 * Resultado del login con Google OAuth
 */
export interface GoogleLoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  needsOnboarding: boolean;
}

/**
 * Configuración del hook useGoogleAuth
 */
interface UseGoogleAuthConfig {
  onSuccess?: (result: GoogleLoginResult) => void;
  onError?: (error: string) => void;
}

export const useGoogleAuth = (config?: UseGoogleAuthConfig) => {
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const authConfig = useMemo<Google.GoogleAuthRequestConfig>(() => {
    const cfg: Google.GoogleAuthRequestConfig = {};
    if (GOOGLE_ANDROID_CLIENT_ID) cfg.androidClientId = GOOGLE_ANDROID_CLIENT_ID;
    if (GOOGLE_IOS_CLIENT_ID) cfg.iosClientId = GOOGLE_IOS_CLIENT_ID;
    if (GOOGLE_WEB_CLIENT_ID) {
      cfg.webClientId = GOOGLE_WEB_CLIENT_ID;
      cfg.expoClientId = GOOGLE_WEB_CLIENT_ID;
    }
    return cfg;
  }, []);

  // Evitar crash si faltan los client IDs (p. ej. build con env incorrecto)
  const googleSupported = Boolean(authConfig.androidClientId || authConfig.iosClientId || authConfig.webClientId);
  if (!googleSupported && __DEV__) {
    console.warn('[useGoogleAuth] Missing Google client IDs. Check APP_ENV and .env.* files.');
  }

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(authConfig);

  const authenticateWithBackend = useCallback(
    async (idToken: string) => {
      setIsProcessing(true);
      setError(null);

      try {
        const result = await DI.loginWithGoogle.execute({ idToken });
        setUser(result.user);

        // Invocar callback de éxito si fue proporcionado
        if (config?.onSuccess) {
          config.onSuccess(result);
        }
      } catch (err: any) {
        const message =
          err?.response?.data?.error?.message ??
          err?.message ??
          'No pudimos completar el inicio de sesion con Google.';
        setError(message);

        // Invocar callback de error si fue proporcionado
        if (config?.onError) {
          config.onError(message);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [setUser, config],
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const token = (response.params as any)?.id_token ?? response.authentication?.idToken;
      if (token) {
        authenticateWithBackend(token);
      } else {
        setIsProcessing(false);
        setError('Google no entrego un token valido.');
      }
    } else if (response?.type === 'error') {
      setIsProcessing(false);
      setError(response.error?.message ?? 'Error al conectar con Google.');
    }
  }, [response, authenticateWithBackend]);

  const startGoogleAuth = useCallback(async () => {
    if (!googleSupported || !request) {
      Alert.alert('Google Sign-In no disponible', 'Revisa la configuracion de los client IDs de Google.');
      return;
    }

    setError(null);
    await promptAsync();
  }, [googleSupported, promptAsync, request]);

  return {
    startGoogleAuth,
    googleError: error,
    googleLoading: isProcessing,
  };
};
