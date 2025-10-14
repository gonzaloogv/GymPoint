import { useState } from 'react';
import { DI } from '@di/container';
import { useAuthStore } from '../state/auth.store';

interface LoginData {
  email: string;
  password: string;
}

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((state) => state.setUser);

  const login = async (data: LoginData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await DI.loginUser.execute({
        email: data.email,
        password: data.password,
      });

      // Actualizar el estado del usuario en el store
      setUser(response.user);

      return { success: true };
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Credenciales inválidas';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    error,
  };
};
