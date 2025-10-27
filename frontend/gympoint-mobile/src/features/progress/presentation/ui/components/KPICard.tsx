import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change: number;
  changeType: 'up' | 'down' | 'neutral';
}

export function KPICard({ icon, label, value, change, changeType }: KPICardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const changeColor = changeType === 'up' ? '#10B981' : changeType === 'down' ? '#EF4444' : '#9CA3AF';
  const changeSymbol = changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : '';

  return (
    <View
      className={`flex-1 rounded-2xl p-5 mx-0.5 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}
    >
      <View className="flex-row items-center mb-4">
        <View className="mr-3 w-6 h-6 items-center justify-center">{icon}</View>
        <Text className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{label}</Text>
      </View>

      <Text className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </Text>

      <Text style={{ color: changeColor }} className="text-sm font-semibold">
        {changeSymbol} {Math.abs(change)}
      </Text>
    </View>
  );
}
