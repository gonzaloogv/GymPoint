import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@shared/hooks';
import { MetricCard } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';

interface KPICardProps {
  icon: React.ReactNode | keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  unit?: string;
}

/**
 * @deprecated Use MetricCard from @shared/components/ui instead
 * KPICard wrapper for backward compatibility
 */
export function KPICard({ icon, label, value, unit }: KPICardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Si icon es un string (nombre de Ionicons), usar MetricCard
  if (typeof icon === 'string') {
    return (
      <View className="flex-1 mx-0.5">
        <View
          className={`rounded-2xl p-5 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
        >
          <MetricCard
            label={label}
            value={value}
            unit={unit}
            icon={icon as keyof typeof Ionicons.glyphMap}
          />
        </View>
      </View>
    );
  }

  // Fallback para cuando se pasa un ReactNode como icon (compatibilidad)
  return (
    <View
      className={`flex-1 rounded-2xl p-5 mx-0.5 ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}
    >
      <View className="flex-row items-center mb-4">
        <View className="mr-3 w-10 h-10 items-center justify-center">{icon}</View>
        <MetricCard label={label} value={value} unit={unit} />
      </View>
    </View>
  );
}
