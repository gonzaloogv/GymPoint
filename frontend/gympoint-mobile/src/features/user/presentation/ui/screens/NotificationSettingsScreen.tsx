/**
 * NotificationSettingsScreen - Pantalla de configuración de notificaciones
 * Integrada con backend: GET/PUT /api/users/me/notifications/settings
 */

import React from 'react';
import { ScrollView, View, Text, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotificationSettings } from '../../hooks/useNotificationSettings';
import { useTheme } from '@shared/hooks';

export const NotificationSettingsScreen: React.FC = () => {
  const { theme: themeMode } = useTheme();
  const isDark = themeMode === 'dark';

  const {
    loading,
    settings,
    error,
    toggleNotificationType,
    togglePushNotifications,
    toggleEmailNotifications,
  } = useNotificationSettings();

  // Loading state
  if (loading && !settings) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: isDark ? '#111827' : '#F9FAFB' }}
      >
        <View className="flex-1 justify-center items-center p-5">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text
            className="mt-3 text-base"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
          >
            Cargando configuración...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !settings) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: isDark ? '#111827' : '#F9FAFB' }}
      >
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-base text-center" style={{ color: '#EF4444' }}>
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? '#111827' : '#F9FAFB' }}
    >
      <ScrollView className="flex-1">
        {/* Header */}
        <View
          className="p-5 border-b"
          style={{
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderBottomColor: isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB',
          }}
        >
          <Text
            className="text-2xl font-bold mb-2"
            style={{ color: isDark ? '#F9FAFB' : '#111827' }}
          >
            Configuración de Notificaciones
          </Text>
          <Text
            className="text-sm"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
          >
            Personaliza qué notificaciones deseas recibir
          </Text>
        </View>

        {/* Sección: Canales Globales */}
        <View
          className="mt-5 py-3 border-t border-b"
          style={{
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderColor: isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB',
          }}
        >
          <Text
            className="text-sm font-semibold uppercase px-5 mb-2"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
          >
            Canales de Notificación
          </Text>

          <SettingRow
            label="Notificaciones Push"
            description="Recibir notificaciones push en tu dispositivo"
            value={settings?.pushEnabled ?? false}
            onToggle={togglePushNotifications}
            disabled={loading}
            isDark={isDark}
          />

          <SettingRow
            label="Notificaciones por Email"
            description="Recibir notificaciones en tu correo electrónico"
            value={settings?.emailEnabled ?? false}
            onToggle={toggleEmailNotifications}
            disabled={loading}
            isDark={isDark}
          />
        </View>

        {/* Sección: Tipos de Notificaciones */}
        <View
          className="mt-5 py-3 border-t border-b"
          style={{
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderColor: isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB',
          }}
        >
          <Text
            className="text-sm font-semibold uppercase px-5 mb-2"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
          >
            Tipos de Notificaciones
          </Text>

          <SettingRow
            label="Recordatorios"
            description="Recordatorios de entrenamientos y rutinas"
            value={settings?.remindersEnabled ?? false}
            onToggle={() => toggleNotificationType('remindersEnabled')}
            disabled={loading}
            isDark={isDark}
          />

          <SettingRow
            label="Logros"
            description="Notificaciones de logros y metas alcanzadas"
            value={settings?.achievementsEnabled ?? false}
            onToggle={() => toggleNotificationType('achievementsEnabled')}
            disabled={loading}
            isDark={isDark}
          />

          <SettingRow
            label="Recompensas"
            description="Nuevas recompensas y tokens ganados"
            value={settings?.rewardsEnabled ?? false}
            onToggle={() => toggleNotificationType('rewardsEnabled')}
            disabled={loading}
            isDark={isDark}
          />

          <SettingRow
            label="Novedades de Gimnasios"
            description="Actualizaciones de tus gimnasios favoritos"
            value={settings?.gymUpdatesEnabled ?? false}
            onToggle={() => toggleNotificationType('gymUpdatesEnabled')}
            disabled={loading}
            isDark={isDark}
          />

          <SettingRow
            label="Pagos"
            description="Notificaciones de pagos y suscripciones"
            value={settings?.paymentEnabled ?? false}
            onToggle={() => toggleNotificationType('paymentEnabled')}
            disabled={loading}
            isDark={isDark}
          />

          <SettingRow
            label="Social"
            description="Actividad de amigos y comunidad"
            value={settings?.socialEnabled ?? false}
            onToggle={() => toggleNotificationType('socialEnabled')}
            disabled={loading}
            isDark={isDark}
          />

          <SettingRow
            label="Sistema"
            description="Notificaciones importantes del sistema"
            value={settings?.systemEnabled ?? false}
            onToggle={() => toggleNotificationType('systemEnabled')}
            disabled={loading}
            isDark={isDark}
          />

          <SettingRow
            label="Desafíos"
            description="Invitaciones y actualizaciones de desafíos"
            value={settings?.challengeEnabled ?? false}
            onToggle={() => toggleNotificationType('challengeEnabled')}
            disabled={loading}
            isDark={isDark}
          />
        </View>

        {/* Sección: Horario Silencioso */}
        <View
          className="mt-5 py-3 border-t border-b"
          style={{
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderColor: isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB',
          }}
        >
          <Text
            className="text-sm font-semibold uppercase px-5 mb-2"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
          >
            Horario Silencioso
          </Text>
          <Text
            className="text-xs px-5 mb-3"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
          >
            No recibirás notificaciones durante este período
          </Text>

          {settings?.quietHoursStart && settings?.quietHoursEnd ? (
            <View className="px-5 py-3">
              <Text
                className="text-base font-medium"
                style={{ color: isDark ? '#F9FAFB' : '#111827' }}
              >
                {settings.quietHoursStart} - {settings.quietHoursEnd}
              </Text>
            </View>
          ) : (
            <Text
              className="text-sm px-5 py-3"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              No configurado
            </Text>
          )}
        </View>

        {/* Loading overlay */}
        {loading && settings && (
          <View
            className="absolute inset-0 justify-center items-center"
            style={{
              backgroundColor: isDark
                ? 'rgba(17, 24, 39, 0.7)'
                : 'rgba(255, 255, 255, 0.7)',
            }}
          >
            <ActivityIndicator size="small" color="#3B82F6" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Componente auxiliar para una fila de configuración con switch
 */
interface SettingRowProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
  isDark: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  label,
  description,
  value,
  onToggle,
  disabled = false,
  isDark,
}) => (
  <View
    className="flex-row justify-between items-center py-3 px-5 border-b"
    style={{
      borderBottomColor: isDark ? 'rgba(55, 65, 81, 0.5)' : '#F3F4F6',
    }}
  >
    <View className="flex-1 mr-4">
      <Text
        className="text-base font-medium mb-1"
        style={{ color: isDark ? '#F9FAFB' : '#111827' }}
      >
        {label}
      </Text>
      <Text
        className="text-xs"
        style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
      >
        {description}
      </Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      disabled={disabled}
      trackColor={{ false: isDark ? '#374151' : '#E5E7EB', true: '#10B981' }}
      thumbColor={value ? '#F9FAFB' : '#F9FAFB'}
    />
  </View>
);
