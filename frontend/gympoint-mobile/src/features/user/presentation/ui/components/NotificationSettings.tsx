import React from 'react';
import { Switch as RNSwitch, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { NotificationSettings as NotificationSettingsType } from '@features/user/types/userTypes';

interface NotificationSettingsProps {
  notifications: NotificationSettingsType;
  onToggle: (key: keyof NotificationSettingsType, value: boolean) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  notifications,
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
        <Feather name="bell" size={16} color={textColor} />
        <Text className="font-semibold text-base" style={{ color: textColor }}>
          Notificaciones
        </Text>
      </View>

      {/* Recordatorios de check-in */}
      <View className="flex-row items-center justify-between py-3">
        <View className="flex-1">
          <Text className="font-medium text-base" style={{ color: textColor }}>
            Recordatorios de check-in
          </Text>
          <Text className="text-xs" style={{ color: subtextColor, opacity: 0.6 }}>
            Te avisamos para mantener tu racha
          </Text>
        </View>
        <RNSwitch
          value={notifications.checkinReminders}
          onValueChange={(value) => onToggle('checkinReminders', value)}
          trackColor={{ false: '#D1D5DB', true: '#4F9CF9' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Alertas de racha */}
      <View className="flex-row items-center justify-between py-3">
        <View className="flex-1">
          <Text className="font-medium text-base" style={{ color: textColor }}>
            Alertas de racha
          </Text>
          <Text className="text-xs" style={{ color: subtextColor, opacity: 0.6 }}>
            Notificaciones sobre milestones
          </Text>
        </View>
        <RNSwitch
          value={notifications.streakAlerts}
          onValueChange={(value) => onToggle('streakAlerts', value)}
          trackColor={{ false: '#D1D5DB', true: '#4F9CF9' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Nuevas recompensas */}
      <View className="flex-row items-center justify-between py-3">
        <View className="flex-1">
          <Text className="font-medium text-base" style={{ color: textColor }}>
            Nuevas recompensas
          </Text>
          <Text className="text-xs" style={{ color: subtextColor, opacity: 0.6 }}>
            Cuando hay nuevos canjes disponibles
          </Text>
        </View>
        <RNSwitch
          value={notifications.rewardUpdates}
          onValueChange={(value) => onToggle('rewardUpdates', value)}
          trackColor={{ false: '#D1D5DB', true: '#4F9CF9' }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
};
