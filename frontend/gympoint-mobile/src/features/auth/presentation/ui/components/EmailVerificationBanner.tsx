/**
 * EmailVerificationBanner - Banner informativo para verificación de email
 * Se muestra cuando el usuario no ha verificado su email
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@shared/services/api';

type EmailVerificationBannerProps = {
  email: string;
};

export function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isLoading, setIsLoading] = useState(false);
  const [lastSentTime, setLastSentTime] = useState<number | null>(null);

  const handleResendEmail = useCallback(async () => {
    // Rate limiting: 5 minutos entre reenvíos
    const now = Date.now();
    if (lastSentTime && (now - lastSentTime) < 5 * 60 * 1000) {
      const remainingMinutes = Math.ceil((5 * 60 * 1000 - (now - lastSentTime)) / 60000);
      Alert.alert(
        'Espera un momento',
        `Puedes reenviar el email en ${remainingMinutes} minuto${remainingMinutes > 1 ? 's' : ''}.`
      );
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/api/auth/resend-verification', { email });

      setLastSentTime(now);

      Alert.alert(
        'Email enviado',
        'Hemos enviado un nuevo enlace de verificación a tu correo. Por favor, revisa tu bandeja de entrada y spam.',
        [{ text: 'Entendido' }]
      );
    } catch (error: any) {
      console.error('[EmailVerificationBanner] Error:', error);

      const errorMessage =
        error?.response?.status === 429
          ? 'Has enviado demasiadas solicitudes. Por favor, espera unos minutos e intenta nuevamente.'
          : error?.response?.data?.error?.message ||
            error?.message ||
            'No se pudo enviar el email. Intenta nuevamente.';

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, lastSentTime]);

  return (
    <View
      className="mx-4 mt-3 mb-2 rounded-2xl p-4"
      style={{
        backgroundColor: isDark ? '#1F2937' : '#FEF3C7',
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#FCD34D',
      }}
    >
      <View className="flex-row items-start gap-3">
        {/* Icono */}
        <View className="mt-0.5">
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color={isDark ? '#FBBF24' : '#D97706'}
          />
        </View>

        {/* Contenido */}
        <View className="flex-1">
          <Text
            className={`text-sm font-semibold mb-1 ${
              isDark ? 'text-yellow-400' : 'text-yellow-800'
            }`}
          >
            Verifica tu email
          </Text>
          <Text
            className={`text-xs leading-5 mb-3 ${
              isDark ? 'text-yellow-200/80' : 'text-yellow-700'
            }`}
          >
            Enviamos un enlace de verificación a <Text className="font-semibold">{email}</Text>.
            Tenés 7 días para verificar tu cuenta.
          </Text>

          {/* Botón de reenvío */}
          <TouchableOpacity
            onPress={handleResendEmail}
            disabled={isLoading}
            activeOpacity={0.7}
            className="flex-row items-center justify-center rounded-xl p-2.5"
            style={{
              backgroundColor: isDark ? '#374151' : '#FFFFFF',
              borderWidth: 1,
              borderColor: isDark ? '#4B5563' : '#FCD34D',
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={isDark ? '#FBBF24' : '#D97706'} />
            ) : (
              <>
                <Ionicons
                  name="mail-outline"
                  size={16}
                  color={isDark ? '#FBBF24' : '#D97706'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  className={`text-xs font-semibold ${
                    isDark ? 'text-yellow-400' : 'text-yellow-800'
                  }`}
                >
                  Reenviar email
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
