import React from 'react';
import { Switch as RNSwitch, View, Text, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

interface NotificationSettingsProps {
  enabled: boolean;
  onToggle: (value: boolean) => void;
  loading?: boolean;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  enabled,
  onToggle,
  loading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';
  const subtextColor = isDark ? '#9ca3af' : '#6b7280';

  const handleToggle = (value: boolean) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 [NotificationSettings] Toggle changed');
    console.log('   Previous value:', enabled);
    console.log('   New value:', value);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    onToggle(value);
  };

  return (
    <View className="mb-6">
      {/* Título de la sección */}
      <View className="flex-row items-center gap-1.5 mb-3">
        <Feather name="bell" size={16} color={textColor} />
        <Text className="font-semibold text-base" style={{ color: textColor }}>
          Notificaciones
        </Text>
      </View>

      {/* Toggle único de notificaciones push */}
      <View className="flex-row items-center justify-between py-3">
        <View className="flex-1">
          <Text className="font-medium text-base" style={{ color: textColor }}>
            Notificaciones Push
          </Text>
          <Text className="text-xs" style={{ color: subtextColor, opacity: 0.6 }}>
            Recibir todas las notificaciones push
          </Text>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color="#4F9CF9" />
        ) : (
          <RNSwitch
            value={enabled}
            onValueChange={handleToggle}
            trackColor={{ false: '#D1D5DB', true: '#4F9CF9' }}
            thumbColor="#FFFFFF"
          />
        )}
      </View>
    </View>
  );
};
