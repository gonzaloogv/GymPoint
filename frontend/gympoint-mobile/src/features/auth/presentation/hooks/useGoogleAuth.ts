import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';

import { GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '@shared/config/env';
import { DI } from '@di/container';
import { useAuthStore } from '../state/auth.store';

export const useGoogleAuth = () => {
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
        Alert.alert('Bienvenido a GymPoint', 'Sesion iniciada con Google.');
      } catch (err: any) {
        const message =
          err?.response?.data?.error?.message ??
          err?.message ??
          'No pudimos completar el inicio de sesion con Google.';
        setError(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [setUser],
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const token = (response.params as any)?.id_token ?? response.authentication?.idToken;
      if (token) {
        authenticateWithBackend(token);
      } else {
        setError('Google no entrego un token valido.');
      }
    } else if (response?.type === 'error') {
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
