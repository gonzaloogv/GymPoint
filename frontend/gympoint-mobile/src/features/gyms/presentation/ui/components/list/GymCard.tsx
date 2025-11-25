import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import LogoIcon from '@assets/icons/logo-nobg.svg';

type Props = {
  id: string | number;
  name: string;
  distancia?: number;
  address?: string;
  index: number;
  onPress?: (id: string | number) => void;
};

// Paleta de colores para los badges de logo (5 colores que se repiten cíclicamente)
const BADGE_COLORS = [
  { dark: '#4F46E5', light: '#4338CA' }, // Indigo
  { dark: '#EC4899', light: '#DB2777' }, // Pink
  { dark: '#8B5CF6', light: '#7C3AED' }, // Purple
  { dark: '#06B6D4', light: '#0891B2' }, // Cyan
  { dark: '#F59E0B', light: '#D97706' }, // Amber
];

export function GymCard({
  id,
  name,
  distancia,
  address,
  index,
  onPress,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatDistance = (distance?: number) =>
    typeof distance === 'number' ? `${(distance / 1000).toFixed(1)} km` : '—';

  // Seleccionar color del badge basado en el índice (cíclico)
  const badgeColor = BADGE_COLORS[index % BADGE_COLORS.length];
  const backgroundColor = isDark ? badgeColor.dark : badgeColor.light;

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 24,
        elevation: 10,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 22,
        elevation: 5,
      };

  return (
    <TouchableOpacity
      onPress={() => onPress?.(id)}
      activeOpacity={0.72}
      className="border rounded-[28px] px-5 py-[18px]"
      style={[
        {
          backgroundColor: isDark ? '#111827' : '#ffffff',
          borderColor: isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB',
        },
        shadowStyle,
      ]}
    >
      <View className="flex-row items-center gap-3">
        {/* GymPoint Logo Icon */}
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{
            backgroundColor,
          }}
        >
          <LogoIcon width={28} height={28} />
        </View>

        {/* Content */}
        <View className="flex-1 gap-1">
          {/* Gym Name */}
          <Text
            className="font-bold text-lg"
            style={{ color: isDark ? '#F9FAFB' : '#111827' }}
            numberOfLines={1}
          >
            {name}
          </Text>

          {/* Distance */}
          <Text
            className="text-[13px] font-semibold"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 0.2 }}
          >
            {formatDistance(distancia)}
          </Text>

          {/* Address */}
          {address && (
            <Text
              className="text-xs font-medium"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
              numberOfLines={1}
            >
              {address}
            </Text>
          )}
        </View>

        {/* Chevron Right Indicator */}
        <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 18 }}>›</Text>
      </View>
    </TouchableOpacity>
  );
}
