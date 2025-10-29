import { useState } from 'react';
import * as Location from 'expo-location';
import { AssistanceRemote } from '../../data/assistance.remote';

export interface UseCheckInResult {
  checkIn: (gymId: number | string) => Promise<boolean>;
  isCheckingIn: boolean;
  error: string | null;
}

/**
 * Hook para manejar el check-in en gimnasios
 */
export function useCheckIn(): UseCheckInResult {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkIn = async (gymId: number | string): Promise<boolean> => {
    setIsCheckingIn(true);
    setError(null);

    try {
      // Asegurar que gymId sea un número
      const gymIdNumber = typeof gymId === 'string' ? parseInt(gymId, 10) : gymId;

      console.log('🚀 [useCheckIn] Iniciando check-in para gymId:', gymIdNumber, '(tipo:', typeof gymIdNumber, ')');

      // Obtener ubicación actual del usuario
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        const errorMsg = 'Se requieren permisos de ubicación para hacer check-in';
        console.error('❌ [useCheckIn]', errorMsg);
        setError(errorMsg);
        return false;
      }

      console.log('📍 [useCheckIn] Obteniendo ubicación actual...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      console.log('📍 [useCheckIn] Ubicación obtenida:', {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });

      // Realizar check-in
      console.log('📤 [useCheckIn] Enviando request:', {
        id_gym: gymIdNumber,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });

      const response = await AssistanceRemote.checkIn({
        id_gym: gymIdNumber,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      });

      console.log('✅ [useCheckIn] Check-in exitoso:', response);
      setIsCheckingIn(false);
      return true;
    } catch (err: any) {
      console.error('❌ [useCheckIn] Error:', err);

      let errorMessage = 'Error al hacer check-in';

      if (err.response?.data?.error) {
        const errorData = err.response.data.error;

        switch (errorData.code) {
          case 'OUT_OF_RANGE':
            errorMessage = 'Estás muy lejos del gimnasio. Debes estar dentro del radio permitido.';
            break;
          case 'GPS_INACCURATE':
            errorMessage = 'La precisión del GPS es insuficiente. Intenta en un lugar con mejor señal.';
            break;
          case 'SUBSCRIPTION_REQUIRED':
            errorMessage = 'Debes tener una suscripción activa para hacer check-in.';
            break;
          default:
            errorMessage = errorData.message || errorMessage;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setIsCheckingIn(false);
      return false;
    }
  };

  return {
    checkIn,
    isCheckingIn,
    error,
  };
}
