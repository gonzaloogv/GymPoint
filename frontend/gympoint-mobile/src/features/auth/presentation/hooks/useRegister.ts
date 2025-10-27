import { useState } from 'react';
import { DI } from '@di/container';
import { useAuthStore } from '../state/auth.store';
import { parseBackendError, logError } from '@shared/utils/errorParser';

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  location: string;
  birth_date: string;
  gender: string;
  weeklyFrequency: number;
}

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((state) => state.setUser);

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      // Validar que fullName existe
      if (!data.fullName || typeof data.fullName !== 'string') {
        throw new Error('El nombre completo es requerido');
      }

      // Separar nombre y apellido
      const nameParts = data.fullName.trim().split(' ');
      const name = nameParts[0] || '';
      const lastname = nameParts.slice(1).join(' ') || name;

      // Validar campos requeridos
      if (!data.email || !data.password) {
        throw new Error('Email y contraseña son requeridos');
      }

      if (!data.gender) {
        throw new Error('El género es requerido');
      }

      if (!data.location) {
        throw new Error('La localidad es requerida');
      }

      if (!data.birth_date) {
        throw new Error('La fecha de nacimiento es requerida');
      }

      const response = await DI.registerUser.execute({
        name,
        lastname,
        email: data.email,
        password: data.password,
        gender: data.gender,
        locality: data.location,
        birth_date: data.birth_date,
        frequency_goal: data.weeklyFrequency,
      });

      console.log('✅ Registro exitoso:', response);

      // Actualizar el estado del usuario en el store
      setUser({
        id_user: response.id,
        name: response.name,
        email: response.email,
        role: 'USER',
        tokens: 0,
        plan: response.subscription === 'PREMIUM' ? 'Premium' : 'Free',
      });

      return { success: true };
    } catch (err: any) {
      // Usar utilidad centralizada para logging y parsing de errores
      logError('Registro', err);
      const errorMessage = parseBackendError(err);

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
    error,
  };
};
