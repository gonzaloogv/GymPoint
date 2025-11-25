import { useState } from 'react';
import { DI } from '@di/container';
import { parseBackendError, logError } from '@shared/utils/errorParser';
import { useAuthStore } from '../state/auth.store';
import { User } from '../../domain/entities/User';

interface OnboardingData {
  frequencyGoal: number;
  birthDate: string;
  gender: 'M' | 'F' | 'O';
}

export const useOnboarding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateUser } = useAuthStore();

  const completeOnboarding = async (data: OnboardingData) => {
    setLoading(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!data.frequencyGoal || data.frequencyGoal < 1 || data.frequencyGoal > 7) {
        throw new Error('La frecuencia debe ser entre 1 y 7 días');
      }

      if (!data.birthDate) {
        throw new Error('La fecha de nacimiento es requerida');
      }

      if (!data.gender) {
        throw new Error('El género es requerido');
      }

      const updatedUser: User = await DI.authRepository.completeOnboarding({
        frequencyGoal: data.frequencyGoal,
        birthDate: data.birthDate,
        gender: data.gender,
      });

      console.log('✅ Onboarding completado:', updatedUser);

      // Actualizar el usuario en el store
      updateUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (err: any) {
      // Log COMPLETO del error para debugging
      console.error('❌ [ONBOARDING] Error completo:', {
        message: err?.message,
        status: err?.response?.status,
        backendError: err?.response?.data,
        config: {
          url: err?.config?.url,
          data: err?.config?.data,
        },
      });

      logError('Onboarding', err);
      const errorMessage = parseBackendError(err);

      // Mostrar el error real del backend si está disponible
      const detailedError = err?.response?.data?.error?.message || errorMessage;

      setError(detailedError);
      return { success: false, error: detailedError };
    } finally {
      setLoading(false);
    }
  };

  return {
    completeOnboarding,
    loading,
    error,
  };
};
