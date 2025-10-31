import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

interface StatsCardProps {
  label: string;
  currentValue: number | null;
  previousValue?: number | null;
  unit: string;
  decimals?: number;
  /** Si true, valores más altos son mejores (verde). Si false, valores más bajos son mejores */
  higherIsBetter?: boolean;
}

export function StatsCard({
  label,
  currentValue,
  previousValue,
  unit,
  decimals = 1,
  higherIsBetter = true,
}: StatsCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Calcular delta
  const hasDelta = previousValue !== null && previousValue !== undefined && currentValue !== null;
  const delta = hasDelta ? currentValue! - previousValue! : 0;
  const deltaPercent = hasDelta && previousValue !== 0
    ? ((delta / Math.abs(previousValue!)) * 100)
    : 0;

  // Determinar si el cambio es positivo o negativo según el contexto
  const isPositive = higherIsBetter ? delta > 0 : delta < 0;
  const isNegative = higherIsBetter ? delta < 0 : delta > 0;

  // Color del delta
  const deltaColor = isPositive
    ? isDark ? '#34D399' : '#10B981' // green
    : isNegative
    ? isDark ? '#F87171' : '#EF4444' // red
    : isDark ? '#9CA3AF' : '#6B7280'; // gray

  return (
    <View
      className={`p-4 rounded-xl ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}
    >
      {/* Label */}
      <Text className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {label}
      </Text>

      {/* Current Value */}
      {currentValue !== null ? (
        <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {currentValue.toFixed(decimals)} {unit}
        </Text>
      ) : (
        <Text className={`text-2xl font-bold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          Sin datos
        </Text>
      )}

      {/* Delta */}
      {hasDelta && delta !== 0 && (
        <View className="flex-row items-center mt-2">
          <Ionicons
            name={isPositive ? 'trending-up' : isNegative ? 'trending-down' : 'remove'}
            size={16}
            color={deltaColor}
          />
          <Text
            className="ml-1 text-sm font-semibold"
            style={{ color: deltaColor }}
          >
            {delta > 0 ? '+' : ''}{delta.toFixed(decimals)} {unit}
          </Text>
          <Text
            className="ml-2 text-xs"
            style={{ color: deltaColor }}
          >
            ({deltaPercent > 0 ? '+' : ''}{deltaPercent.toFixed(1)}%)
          </Text>
        </View>
      )}
    </View>
  );
}
