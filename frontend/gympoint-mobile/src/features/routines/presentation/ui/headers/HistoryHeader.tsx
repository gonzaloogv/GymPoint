import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '@shared/hooks';

type Props = {
  routineName: string;
  sessionsCount: number;
  loading?: boolean;
};

export function HistoryHeader({ routineName, sessionsCount, loading = false }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const primary = isDark ? '#F9FAFB' : '#111827';
  const secondary = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <View className="px-4 pb-3 gap-1.5">
      <Text className="text-[32px] font-extrabold" style={{ color: primary, letterSpacing: -0.4 }}>
        Historial
      </Text>
      <Text className="text-base font-semibold" style={{ color: secondary }}>
        {routineName}
      </Text>
      {loading ? (
        <View className="py-1">
          <ActivityIndicator size="small" color={secondary} />
        </View>
      ) : (
        <Text
          className="text-xs font-semibold uppercase"
          style={{ color: secondary, letterSpacing: 1 }}
        >
          {sessionsCount} sesiones registradas
        </Text>
      )}
    </View>
  );
}
