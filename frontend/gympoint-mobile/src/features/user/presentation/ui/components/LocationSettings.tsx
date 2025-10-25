/**
 * LocationSettings - Configuración de ubicación
 * Permite al usuario controlar el acceso a su ubicación para encontrar gimnasios cercanos
 */

import React from 'react';
import { View, Text, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

interface LocationSettingsProps {
  locationEnabled: boolean;
  onToggle: (value: boolean) => void;
}

export const LocationSettings: React.FC<LocationSettingsProps> = ({
  locationEnabled,
  onToggle,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';
  const subtextColor = isDark ? '#9ca3af' : '#6b7280';

  return (
    <View className="mb-6">
      {/* Título de la sección */}
      <View className="flex-row items-center gap-1.5 mb-3">
        <Feather name="map-pin" size={16} color={textColor} />
        <Text className="font-semibold text-base" style={{ color: textColor }}>
          Ubicación
        </Text>
      </View>

      {/* Switch de ubicación */}
      <View>
        <Text className="font-medium text-base mb-1" style={{ color: textColor }}>
          Acceso a ubicación
        </Text>
        <Text className="text-xs mb-2" style={{ color: subtextColor, opacity: 0.6 }}>
          Para encontrar gimnasios cercanos
        </Text>
        <View className="flex-row items-center">
          <Switch
            value={locationEnabled}
            onValueChange={onToggle}
            trackColor={{ false: '#D1D5DB', true: '#4F9CF9' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );
};
