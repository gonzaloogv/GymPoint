/**
 * SettingsCard - Card contenedor de todas las configuraciones
 * Agrupa las configuraciones de notificaciones y ubicación
 */

import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '@shared/components/ui';
import { NotificationSettings } from './NotificationSettings';
import { LocationSettings } from './LocationSettings';
import { NotificationSettings as NotificationSettingsType } from '../types/UserTypes';
import { AppTheme } from '@presentation/theme';

interface SettingsCardProps {
  notifications: NotificationSettingsType;
  onNotificationToggle: (key: keyof NotificationSettingsType, value: boolean) => void;
  locationEnabled: boolean;
  onLocationToggle: (value: boolean) => void;
  theme: AppTheme;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  notifications,
  onNotificationToggle,
  locationEnabled,
  onLocationToggle,
  theme,
}) => {
  return (
    <Card>
      {/* Título principal del card */}
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}
      >
        <Feather name="settings" size={20} color={theme.colors.text} />
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text }}>
          Configuración
        </Text>
      </View>

      {/* Configuraciones de notificaciones */}
      <NotificationSettings
        notifications={notifications}
        onToggle={onNotificationToggle}
        theme={theme}
      />

      {/* Configuración de ubicación */}
      <LocationSettings
        locationEnabled={locationEnabled}
        onToggle={onLocationToggle}
        theme={theme}
      />
    </Card>
  );
};
