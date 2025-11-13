import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';

interface ProgressChartProps {
  title: string;
  subtitle?: string;
  count?: number;
  unit?: string;
}

export function ProgressChart({ title, subtitle, count, unit }: ProgressChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View
      className={`mx-4 p-6 rounded-xl mb-4 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
      }`}
      style={{ minHeight: 200 }}
    >
      <Text className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </Text>

      {subtitle && (
        <Text className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {subtitle}
        </Text>
      )}

      {/* Placeholder for chart */}
      <View className="flex-1 justify-center items-center">
        <View className="flex-row gap-2 mb-4">
          <View className="w-6 h-16 rounded bg-green-500 opacity-70" />
          <View className="w-6 h-20 rounded bg-red-500 opacity-70" />
          <View className="w-6 h-14 rounded bg-blue-500 opacity-70" />
        </View>
        <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Gráfico de progreso
        </Text>
      </View>

      {count && unit && (
        <Text className={`text-xs text-center mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {count} {unit}
        </Text>
      )}
    </View>
  );
}
