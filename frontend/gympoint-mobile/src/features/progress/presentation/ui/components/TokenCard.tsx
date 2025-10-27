import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Ionicons } from '@expo/vector-icons';

interface TokenCardProps {
  type: 'available' | 'earned' | 'spent';
  value: number;
  label: string;
}

// Exact colors from Nuria design - Light mode
const LIGHT_MODE_COLORS = {
  available: {
    bg: '#D1FAE5',
    border: '#86EFAC',
    text: '#059669',
    icon: 'flash' as const,
    iconColor: '#10B981',
  },
  earned: {
    bg: '#DBEAFE',
    border: '#93C5FD',
    text: '#1D4ED8',
    icon: 'trending-up' as const,
    iconColor: '#3B82F6',
  },
  spent: {
    bg: '#FCE7F3',
    border: '#F9A8D4',
    text: '#BE185D',
    icon: 'gift' as const,
    iconColor: '#EC4899',
  },
};

// Dark mode - darker saturated versions maintaining color identity
const DARK_MODE_COLORS = {
  available: {
    bg: '#064E3B',
    border: '#047857',
    text: '#6EE7B7',
    icon: 'flash' as const,
    iconColor: '#34D399',
  },
  earned: {
    bg: '#1E3A8A',
    border: '#1E40AF',
    text: '#93C5FD',
    icon: 'trending-up' as const,
    iconColor: '#60A5FA',
  },
  spent: {
    bg: '#831843',
    border: '#9D174D',
    text: '#F9A8D4',
    icon: 'gift' as const,
    iconColor: '#F472B6',
  },
};

export function TokenCard({ type, value, label }: TokenCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = isDark ? DARK_MODE_COLORS[type] : LIGHT_MODE_COLORS[type];

  return (
    <View
      className="flex-1 p-3 rounded-xl border"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: 1,
      }}
    >
      {/* Icon */}
      <View className="mb-2">
        <Ionicons
          name={colors.icon}
          size={18}
          color={colors.iconColor}
        />
      </View>

      {/* Value */}
      <Text
        className="text-2xl font-bold mb-1"
        style={{ color: colors.text }}
      >
        {value}
      </Text>

      {/* Label */}
      <Text
        className="text-xs font-medium"
        style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
      >
        {label}
      </Text>
    </View>
  );
}
