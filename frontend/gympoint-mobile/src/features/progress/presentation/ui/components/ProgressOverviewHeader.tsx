import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { createScreenPalette } from '@shared/theme/palettes';
import { ActionCard } from '@shared/components/ui';
import { KPICard } from './KPICard';
import StreakIcon from '@assets/icons/streak.svg';
import { Ionicons } from '@expo/vector-icons';

type ProgressOverviewHeaderProps = {
  streak: number;
  weeklyWorkouts: number;
};

export function ProgressOverviewHeader({
  streak,
  weeklyWorkouts,
}: ProgressOverviewHeaderProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const palette = createScreenPalette(isDark);

  return (
    <View className="pt-4 pb-6 gap-6 px-4">
      <View>
        <Text
          className="text-[32px] font-extrabold"
          style={{ color: palette.title, letterSpacing: -0.4 }}
        >
          Progreso
        </Text>
        <Text
          className="mt-2 text-xs font-semibold uppercase"
          style={{ color: palette.subtitle, letterSpacing: 1.2 }}
        >
          Tu rendimiento y metas
        </Text>
      </View>

      <View className="flex-row gap-2">
        <KPICard
          icon={<StreakIcon width={24} height={24} accessibilityLabel="racha" />}
          label="Racha actual"
          value={`${streak} dias`}
        />
        <KPICard
          icon={<Ionicons name="checkmark-circle" size={24} color="#10B981" />}
          label="Esta semana"
          value={`${weeklyWorkouts} entrenos`}
        />
      </View>

      <ActionCard
        label="Como ganar mas tokens?"
        description="Consejos rapidos para optimizar tus recompensas"
        icon="help-circle"
        iconColor={isDark ? '#FDE68A' : '#B45309'}
        iconBackground={isDark ? 'rgba(251, 191, 36, 0.14)' : 'rgba(251, 191, 36, 0.18)'}
        onPress={() => {}}
        layout="horizontal"
      />

      <View className="h-px rounded-full" style={{ backgroundColor: palette.divider }} />
    </View>
  );
}
