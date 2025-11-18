import { useState } from 'react';
import { DI } from '@di/container';
import { parseBackendError, logError } from '@shared/utils/errorParser';

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Validar campos requeridos (solo fase 1)
      if (!data.email || !data.password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // Onboarding 2 fases: solo enviar campos básicos
      const response = await DI.registerUser.execute({
        name,
        lastname,
        email: data.email,
        password: data.password,
        // Backend usará defaults: gender='O', locality=null, birth_date=null, frequency_goal=3
      });

      console.log('✅ Registro exitoso:', response);

      // Onboarding 2 fases: retornar usuario y tokens para que RegisterScreen actualice el store
      return {
        success: true,
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };
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
