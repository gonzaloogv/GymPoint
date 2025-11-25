import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { formatDuration } from '@shared/utils';
import { ExecutionStatsCard } from '../components/ExecutionStatsCard';
import { Button } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  routineName: string;
  duration: number; // segundos
  totalVolume: number; // kg
  setsCompleted: number;
  totalSets: number;
  onTerminate: () => void;
};

export function ExecutionHeader({
  routineName,
  duration,
  totalVolume,
  setsCompleted,
  totalSets,
  onTerminate,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const buttonBg = isDark ? '#6366F1' : '#4F46E5';
  const buttonShadow = isDark ? 'rgba(99, 102, 241, 0.28)' : 'rgba(79, 70, 229, 0.32)';

  return (
    <View className="gap-6 mb-6">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text
            numberOfLines={2}
            className="text-[28px] font-extrabold"
            style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
          >
            {routineName || 'Rutina en progreso'}
          </Text>
          <Text
            className="mt-2 text-xs font-semibold uppercase"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 1.2 }}
          >
            Sesion en progreso
          </Text>
        </View>

        <Button
          onPress={onTerminate}
          size="sm"
          variant="primary"
          className="min-w-[116px]"
          style={{
            backgroundColor: buttonBg,
            shadowColor: buttonShadow,
            elevation: 8,
            shadowOpacity: 0.25,
            shadowOffset: { width: 0, height: 12 },
            shadowRadius: 16,
          }}
        >
          Finalizar
        </Button>
      </View>

      <View className="flex-row">
        <View className="flex-1 mr-3">
          <ExecutionStatsCard
            label="Duracion"
            value={formatDuration(duration)}
            variant="accent"
            icon={<Ionicons name="time-outline" size={20} color="#6366F1" />}
          />
        </View>
        <View className="flex-1 mr-3">
          <ExecutionStatsCard
            label="Volumen"
            value={`${totalVolume.toFixed(0)}kg`}
            variant="default"
            icon={<Ionicons name="barbell-outline" size={20} color="#A78BFA" />}
          />
        </View>
        <View className="flex-1">
          <ExecutionStatsCard
            label="Series"
            value={`${setsCompleted}/${totalSets}`}
            variant="success"
            icon={<Ionicons name="checkmark-done-outline" size={20} color="#34D399" />}
          />
        </View>
      </View>
    </View>
  );
}




