import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { DI } from '@di/container';
import { NotificationSettings } from '../../domain/entities/NotificationSettings';

/**
 * Hook para manejar la configuración de notificaciones del usuario
 * Integrado con backend: GET/PUT /api/users/me/notifications/settings
 */
export function useNotificationSettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener configuración actual de notificaciones
   */
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await DI.userRepository.getNotificationSettings();
      setSettings(data);
    } catch (err: any) {
      console.error('[useNotificationSettings] Error fetching settings:', err);
      const errorMessage = err.response?.data?.error?.message || 'Error al cargar configuración de notificaciones';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar configuración de notificaciones
   * @param updates - Configuración parcial a actualizar
   */
  const updateSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    try {
      setLoading(true);
      setError(null);

      const updatedSettings = await DI.userRepository.updateNotificationSettings(updates);
      setSettings(updatedSettings);

      Alert.alert(
        'Configuración actualizada',
        'Tus preferencias de notificaciones han sido guardadas.',
        [{ text: 'OK' }]
      );

      return updatedSettings;
    } catch (err: any) {
      console.error('[useNotificationSettings] Error updating settings:', err);
      const errorMessage = err.response?.data?.error?.message || 'Error al actualizar configuración';
      setError(errorMessage);

      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Toggle de un tipo de notificación específico
   */
  const toggleNotificationType = useCallback(async (
    type: keyof Pick<NotificationSettings,
      'remindersEnabled' | 'achievementsEnabled' | 'rewardsEnabled' |
      'gymUpdatesEnabled' | 'paymentEnabled' | 'socialEnabled' |
      'systemEnabled' | 'challengeEnabled'
    >
  ) => {
    if (!settings) return;

    const currentValue = settings[type];
    await updateSettings({ [type]: !currentValue });
  }, [settings, updateSettings]);

  /**
   * Toggle de notificaciones push globales
   */
  const togglePushNotifications = useCallback(async () => {
    if (!settings) return;
    await updateSettings({ pushEnabled: !settings.pushEnabled });
  }, [settings, updateSettings]);

  /**
   * Toggle de notificaciones por email
   */
  const toggleEmailNotifications = useCallback(async () => {
    if (!settings) return;
    await updateSettings({ emailEnabled: !settings.emailEnabled });
  }, [settings, updateSettings]);

  /**
   * Configurar horario silencioso
   * @param start - Hora de inicio (HH:MM:SS)
   * @param end - Hora de fin (HH:MM:SS)
   */
  const setQuietHours = useCallback(async (start: string | null, end: string | null) => {
    await updateSettings({
      quietHoursStart: start,
      quietHoursEnd: end,
    });
  }, [updateSettings]);

  // Cargar configuración al montar el componente
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    loading,
    settings,
    error,
    fetchSettings,
    updateSettings,
    toggleNotificationType,
    togglePushNotifications,
    toggleEmailNotifications,
    setQuietHours,
  };
}
