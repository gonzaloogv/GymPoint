/**
 * ForgotPasswordScreen - Pantalla para solicitar restablecimiento de contraseña
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '@shared/hooks';
import { SurfaceScreen, BackButton } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@shared/services/api';
import { isValidEmail } from '@shared/utils/validation';

type ForgotPasswordScreenProps = {
  navigation: any;
};

export function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBackPress = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  const handleSubmit = useCallback(async () => {
    // Validaciones frontend
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/api/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });

      // Mensaje genérico (timing-safe) - no revela si el email existe o no
      Alert.alert(
        'Solicitud enviada',
        'Si existe una cuenta con este email, recibirás un enlace para restablecer tu contraseña. Por favor, revisa tu correo (incluyendo la carpeta de spam).',
        [
          {
            text: 'Aceptar',
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      console.error('[ForgotPassword] Error:', error);

      // El backend devuelve mensaje genérico para evitar enumeration attacks
      // Pero manejamos errores de red u otros problemas técnicos
      const errorMessage =
        error?.response?.status === 429
          ? 'Has enviado demasiadas solicitudes. Por favor, espera unos minutos e intenta nuevamente.'
          : error?.response?.data?.error?.message ||
            error?.message ||
            'No se pudo enviar la solicitud. Intenta nuevamente.';

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, navigation]);

  return (
    <SurfaceScreen
      scroll
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
        gap: 24,
      }}
    >
      {/* Header con botón atrás */}
      <View className="flex-row items-center gap-4">
        <BackButton onPress={handleBackPress} />
        <Text
          className={`text-xl font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}
        >
          Olvidé mi contraseña
        </Text>
      </View>

      {/* Descripción */}
      <View className="px-2">
        <Text
          className={`text-sm ${isDark ? 'text-text-dark/70' : 'text-text/70'}`}
          style={{ lineHeight: 20 }}
        >
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña. El enlace es válido por 1 hora.
        </Text>
      </View>

      {/* Formulario */}
      <View className="gap-4">
        {/* Email */}
        <View>
          <Text
            className={`text-sm font-medium mb-2 ${isDark ? 'text-text-dark' : 'text-text'}`}
          >
            Email
          </Text>
          <View className="relative">
            <TextInput
              className={`rounded-xl p-4 pr-12 text-base ${
                isDark
                  ? 'bg-surface-dark text-text-dark border border-gray-700'
                  : 'bg-white text-text border border-gray-200'
              }`}
              placeholder="tu@email.com"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
            <View className="absolute right-4 top-1/2 -translate-y-2.5">
              <Ionicons
                name="mail-outline"
                size={20}
                color={isDark ? '#B0B8C8' : '#666'}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Botón de enviar */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading}
        activeOpacity={0.78}
        className="rounded-2xl p-4 items-center"
        style={{
          backgroundColor: isLoading
            ? isDark
              ? '#1F2937'
              : '#E5E7EB'
            : '#635BFF',
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        {isLoading ? (
          <ActivityIndicator color={isDark ? '#9CA3AF' : '#6B7280'} />
        ) : (
          <Text
            className="text-base font-bold uppercase text-white"
            style={{ letterSpacing: 0.6 }}
          >
            Enviar enlace
          </Text>
        )}
      </TouchableOpacity>

      {/* Nota de seguridad */}
      <View className="px-2">
        <Text
          className={`text-xs text-center ${isDark ? 'text-text-dark/60' : 'text-text/60'}`}
          style={{ lineHeight: 18 }}
        >
          Por seguridad, recibirás el mismo mensaje independientemente de si el email está registrado o no.
        </Text>
      </View>
    </SurfaceScreen>
  );
}

export default ForgotPasswordScreen;
