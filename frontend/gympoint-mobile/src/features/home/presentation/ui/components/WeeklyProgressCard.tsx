import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { MetricTile } from '@shared/components/ui';

type Props = {
  current: number;
  goal: number;
  progressPct: number; // 0..100
  streak: number;
  onStats?: () => void;
};

export default function WeeklyProgressCard({
  current,
  goal,
  progressPct,
  streak,
  onStats,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const roundedProgress = Math.round(progressPct);

  return (
    <MetricTile
      tone="primary"
      highlight
      valueContent={
        <View className="flex-row items-center">
          {/* Icon Badge */}
          <View
            className="w-14 h-14 rounded-[20px] border items-center justify-center"
            style={{
              borderColor: 'rgba(99, 102, 241, 0.25)',
              backgroundColor: 'rgba(129, 140, 248, 0.18)',
            }}
          >
            <Ionicons name="flag-outline" size={24} color={isDark ? '#C7D2FE' : '#4338CA'} />
          </View>

          {/* Content */}
          <View className="ml-4 flex-1">
            <Text
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              Meta semanal
            </Text>
            <Text className="mt-2 text-[22px] font-bold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
              {current}
              <Text className="text-base font-bold" style={{ color: isDark ? '#C7D2FE' : '#4338CA' }}>
                {` de ${goal}`}
              </Text>
              <Text className="text-base font-semibold" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                {' entrenamientos'}
              </Text>
            </Text>
          </View>
        </View>
      }
    >
      {/* Chips Row */}
      <View className="flex-row mt-4 -mb-2">
        {/* Streak Chip */}
        <View
          className="flex-row items-center py-2.5 px-[14px] rounded-full border mr-3 mb-2"
          style={{
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.16)',
            borderColor: isDark ? 'rgba(16, 185, 129, 0.28)' : 'rgba(16, 185, 129, 0.2)',
          }}
        >
          <Ionicons name="flame" size={16} color={isDark ? '#6EE7B7' : '#047857'} />
          <Text className="ml-2 text-[13px] font-semibold" style={{ color: isDark ? '#6EE7B7' : '#047857' }}>
            Racha {streak}
          </Text>
        </View>

        {/* Progress Chip */}
        <View
          className="flex-row items-center py-2.5 px-[14px] rounded-full border mr-3 mb-2"
          style={{
            backgroundColor: isDark ? 'rgba(37, 99, 235, 0.16)' : 'rgba(59, 130, 246, 0.14)',
            borderColor: isDark ? 'rgba(96, 165, 250, 0.32)' : 'rgba(59, 130, 246, 0.22)',
          }}
        >
          <Ionicons name="trending-up" size={16} color={isDark ? '#93C5FD' : '#1D4ED8'} />
          <Text className="ml-2 text-[13px] font-semibold" style={{ color: isDark ? '#93C5FD' : '#1D4ED8' }}>
            {roundedProgress}% logrado
          </Text>
        </View>
      </View>
    </MetricTile>
  );
}
