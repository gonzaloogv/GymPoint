/**
 * SettingsCard - Card contenedor de todas las configuraciones
 * Agrupa las configuraciones de notificaciones y ubicación
 */

import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';
import { NotificationSettings } from './NotificationSettings';
import { LocationSettings } from './LocationSettings';
import { NotificationSettings as NotificationSettingsType } from '@features/user/types/userTypes';

interface SettingsCardProps {
  notifications: NotificationSettingsType;
  onNotificationToggle: (key: keyof NotificationSettingsType, value: boolean) => void;
  locationEnabled: boolean;
  onLocationToggle: (value: boolean) => void;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  notifications,
  onNotificationToggle,
  locationEnabled,
  onLocationToggle,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';

  return (
    <Card>
      {/* Título principal del card */}
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}
      >
        <Feather name="settings" size={20} color={textColor} />
        <Text style={{ fontSize: 18, fontWeight: '700', color: textColor }}>
          Configuración
        </Text>
      </View>

      {/* Configuraciones de notificaciones */}
      <NotificationSettings
        notifications={notifications}
        onToggle={onNotificationToggle}
      />

      {/* Configuración de ubicación */}
      <LocationSettings
        locationEnabled={locationEnabled}
        onToggle={onLocationToggle}
      />
    </Card>
  );
};
