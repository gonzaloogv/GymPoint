import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export function MetricCard({ label, value, unit, icon, iconColor }: MetricCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View className="flex-1">
      {icon && (
        <View className="flex-row items-center mb-1">
          <Ionicons
            name={icon}
            size={14}
            color={iconColor || (isDark ? '#9CA3AF' : '#6B7280')}
          />
          <Text className={`ml-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {label}
          </Text>
        </View>
      )}
      {!icon && (
        <Text className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          {label}
        </Text>
      )}
      <Text
        className="text-lg font-bold"
        style={{ color: isDark ? '#F9FAFB' : '#111827' }}
      >
        {value}
        {unit && <Text className={`text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-600'}`}> {unit}</Text>}
      </Text>
    </View>
  );
}
