/**
 * Ejemplo de implementación de Google Auth en React Native con Expo
 * 
 * Este archivo muestra cómo implementar el flujo completo de autenticación
 * con Google en el frontend de GymPoint.
 */

import React, { useEffect } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Necesario para que el flujo de auth funcione correctamente
WebBrowser.maybeCompleteAuthSession();

const API_URL = 'http://localhost:3000/api';
const GOOGLE_CLIENT_ID = 'TU_CLIENT_ID.apps.googleusercontent.com';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id_user: number;
    email: string;
    name: string;
    lastname: string;
    subscription: 'FREE' | 'PREMIUM';
    auth_provider: 'local' | 'google';
    google_id?: string;
    tokens: number;
  };
}

export function GoogleLoginScreen() {
  // Configurar Google Auth
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    // Para Android:
    // androidClientId: 'TU_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    // Para iOS:
    // iosClientId: 'TU_IOS_CLIENT_ID.apps.googleusercontent.com',
  });

  // Manejar respuesta de Google
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    } else if (response?.type === 'error') {
      console.error('Error de Google:', response.error);
      alert('Error al iniciar sesión con Google');
    }
  }, [response]);

  /**
   * Envía el ID Token al backend para autenticación
   */
  const handleGoogleLogin = async (idToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Error al autenticar');
      }

      const data: AuthResponse = await response.json();

      // Guardar tokens de forma segura
      await AsyncStorage.setItem('accessToken', data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      console.log('Login exitoso:', data.user);
      
      // Navegar a la pantalla principal
      // navigation.navigate('Home');
      
      alert(`¡Bienvenido ${data.user.name}!`);
    } catch (error) {
      console.error('Error en login con Google:', error);
      alert(error.message || 'Error al iniciar sesión');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <Button
        disabled={!request}
        title="Continuar con Google"
        onPress={() => {
          promptAsync();
        }}
      />

      <Text style={styles.hint}>
        Al continuar, aceptas nuestros Términos y Condiciones
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  hint: {
    marginTop: 20,
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
});

// ========================================
// EJEMPLO 2: Hook personalizado reutilizable
// ========================================

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (response?.type === 'success') {
      authenticateWithBackend(response.params.id_token);
    } else if (response?.type === 'error') {
      setError('Error al conectar con Google');
    }
  }, [response]);

  const authenticateWithBackend = async (idToken: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Error de autenticación');
      }

      const data: AuthResponse = await res.json();

      // Guardar en storage
      await AsyncStorage.multiSet([
        ['accessToken', data.accessToken],
        ['refreshToken', data.refreshToken],
        ['user', JSON.stringify(data.user)],
      ]);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle: () => promptAsync(),
    loading,
    error,
    isReady: !!request,
  };
}

// Uso del hook:
/*
function LoginScreen() {
  const { signInWithGoogle, loading, error, isReady } = useGoogleAuth();

  return (
    <View>
      <Button
        disabled={!isReady || loading}
        title={loading ? 'Iniciando...' : 'Continuar con Google'}
        onPress={signInWithGoogle}
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
*/

// ========================================
// EJEMPLO 3: Manejo de tokens con interceptor
// ========================================

/**
 * Configurar interceptor de Axios para manejar tokens automáticamente
 */
import axios from 'axios';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor de request: agregar token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response: refrescar token si expira
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró (401) y no hemos intentado refrescar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No hay refresh token');
        }

        // Solicitar nuevo access token
        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
          token: refreshToken,
        });

        // Guardar nuevo access token
        await AsyncStorage.setItem('accessToken', data.accessToken);

        // Reintentar request original con nuevo token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, cerrar sesión
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        // Redirigir a login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { api };

// Uso:
/*
import { api } from './api';

// Las peticiones ahora incluyen el token automáticamente
const gyms = await api.get('/gyms/cercanos?lat=-27.4&lon=-58.9');
*/

