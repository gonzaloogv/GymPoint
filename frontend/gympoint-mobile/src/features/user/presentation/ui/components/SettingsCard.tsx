/**
 * SettingsCard - Card contenedor de todas las configuraciones
 * Agrupa las configuraciones de notificaciones, ubicación y tema
 */

import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card, SegmentedControl } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';
import { NotificationSettings } from './NotificationSettings';
import { LocationSettings } from './LocationSettings';

interface SettingsCardProps {
  notificationsEnabled: boolean;
  isLoadingNotifications: boolean;
  onNotificationToggle: (value: boolean) => void;
  locationEnabled: boolean;
  onLocationToggle: (value: boolean) => void;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  notificationsEnabled,
  isLoadingNotifications,
  onNotificationToggle,
  locationEnabled,
  onLocationToggle,
}) => {
  const { theme, themeMode, setThemeMode } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Card>
      {/* Título principal del card */}
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}
      >
        <Feather name="settings" size={20} color={isDark ? '#F9FAFB' : '#111827'} />
        <Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? '#F9FAFB' : '#111827' }}>
          Configuración
        </Text>
      </View>

      {/* Configuraciones de notificaciones */}
      <NotificationSettings
        enabled={notificationsEnabled}
        loading={isLoadingNotifications}
        onToggle={onNotificationToggle}
      />

      {/* Separador */}
      <View style={{ height: 1, backgroundColor: isDark ? '#374151' : '#e5e7eb', marginVertical: 16 }} />

      {/* Configuración de ubicación */}
      <LocationSettings
        locationEnabled={locationEnabled}
        onToggle={onLocationToggle}
      />

      {/* Configuración de tema */}
      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Feather name="moon" size={16} color={isDark ? '#F9FAFB' : '#111827'} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: isDark ? '#F9FAFB' : '#111827' }}>
            Tema
          </Text>
        </View>
        <SegmentedControl
          options={[
            { value: 'light', label: '☀️ Claro' },
            { value: 'dark', label: '🌙 Oscuro' },
            { value: 'auto', label: '⚙️ Auto' },
          ]}
          value={themeMode}
          onChange={(value) => setThemeMode(value as 'light' | 'dark' | 'auto')}
          size="sm"
        />
      </View>
    </Card>
  );
};
