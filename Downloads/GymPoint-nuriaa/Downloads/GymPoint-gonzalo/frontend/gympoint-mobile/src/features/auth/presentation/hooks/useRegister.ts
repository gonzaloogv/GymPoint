import { useState } from 'react';
import { DI } from '@di/container';
import { useAuthStore } from '../state/auth.store';

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  location: string;
  age: number;
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
      // Separar nombre y apellido
      const nameParts = data.fullName.trim().split(' ');
      const name = nameParts[0] || '';
      const lastname = nameParts.slice(1).join(' ') || name;

      const response = await DI.registerUser.execute({
        name,
        lastname,
        email: data.email,
        password: data.password,
        gender: data.gender,
        locality: data.location,
        age: data.age,
        frequency_goal: data.weeklyFrequency,
      });

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
      const errorMessage = err?.response?.data?.error?.message || err?.message || 'Error al registrar usuario';
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
