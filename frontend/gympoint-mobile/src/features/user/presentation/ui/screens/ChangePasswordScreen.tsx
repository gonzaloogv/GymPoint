/**
 * ChangePasswordScreen - Pantalla para cambiar la contraseña del usuario autenticado
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '@shared/hooks';
import { SurfaceScreen, BackButton } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@features/auth';
import { api } from '@shared/services/api';

type ChangePasswordScreenProps = {
  navigation: any;
};

export function ChangePasswordScreen({ navigation }: ChangePasswordScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const setUser = useAuthStore((state) => state.setUser);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBackPress = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  const handleChangePassword = useCallback(async () => {
    // Validaciones frontend
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña actual');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Por favor ingresa una nueva contraseña');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert('Error', 'Por favor confirma tu nueva contraseña');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/api/users/me/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (response.data?.success) {
        Alert.alert(
          'Contraseña actualizada',
          'Tu contraseña se ha cambiado exitosamente. Por seguridad, debes volver a iniciar sesión.',
          [
            {
              text: 'Aceptar',
              onPress: () => {
                // Forzar logout porque todas las sesiones fueron revocadas
                setUser(null);
                navigation.navigate('Login');
              },
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error: any) {
      console.error('[ChangePassword] Error:', error);

      // Manejar errores específicos del backend
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        'No se pudo cambiar la contraseña. Intenta nuevamente.';

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword, setUser, navigation]);

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
          Cambiar contraseña
        </Text>
      </View>

      {/* Descripción */}
      <View className="px-2">
        <Text
          className={`text-sm ${isDark ? 'text-text-dark/70' : 'text-text/70'}`}
          style={{ lineHeight: 20 }}
        >
          Por seguridad, todas tus sesiones activas se cerrarán y deberás volver a iniciar sesión con tu nueva contraseña.
        </Text>
      </View>

      {/* Formulario */}
      <View className="gap-4">
        {/* Contraseña actual */}
        <View>
          <Text
            className={`text-sm font-medium mb-2 ${isDark ? 'text-text-dark' : 'text-text'}`}
          >
            Contraseña actual
          </Text>
          <View className="relative">
            <TextInput
              className={`rounded-xl p-4 pr-12 text-base ${
                isDark
                  ? 'bg-surface-dark text-text-dark border border-gray-700'
                  : 'bg-white text-text border border-gray-200'
              }`}
              placeholder="Ingresa tu contraseña actual"
              placeholderTextColor={isDark ? '#666' : '#999'}
              secureTextEntry={!showCurrentPassword}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              autoCapitalize="none"
              editable={!isLoading}
            />
            <TouchableOpacity
              className="absolute right-4 top-1/2 -translate-y-2.5"
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              disabled={isLoading}
            >
              <Ionicons
                name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={isDark ? '#B0B8C8' : '#666'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Nueva contraseña */}
        <View>
          <Text
            className={`text-sm font-medium mb-2 ${isDark ? 'text-text-dark' : 'text-text'}`}
          >
            Nueva contraseña
          </Text>
          <View className="relative">
            <TextInput
              className={`rounded-xl p-4 pr-12 text-base ${
                isDark
                  ? 'bg-surface-dark text-text-dark border border-gray-700'
                  : 'bg-white text-text border border-gray-200'
              }`}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={isDark ? '#666' : '#999'}
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
              editable={!isLoading}
            />
            <TouchableOpacity
              className="absolute right-4 top-1/2 -translate-y-2.5"
              onPress={() => setShowNewPassword(!showNewPassword)}
              disabled={isLoading}
            >
              <Ionicons
                name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={isDark ? '#B0B8C8' : '#666'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirmar contraseña */}
        <View>
          <Text
            className={`text-sm font-medium mb-2 ${isDark ? 'text-text-dark' : 'text-text'}`}
          >
            Confirmar nueva contraseña
          </Text>
          <View className="relative">
            <TextInput
              className={`rounded-xl p-4 pr-12 text-base ${
                isDark
                  ? 'bg-surface-dark text-text-dark border border-gray-700'
                  : 'bg-white text-text border border-gray-200'
              }`}
              placeholder="Repite tu nueva contraseña"
              placeholderTextColor={isDark ? '#666' : '#999'}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
              editable={!isLoading}
            />
            <TouchableOpacity
              className="absolute right-4 top-1/2 -translate-y-2.5"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={isDark ? '#B0B8C8' : '#666'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Botón de guardar */}
      <TouchableOpacity
        onPress={handleChangePassword}
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
            Guardar cambios
          </Text>
        )}
      </TouchableOpacity>
    </SurfaceScreen>
  );
}
