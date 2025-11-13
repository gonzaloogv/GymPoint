import React from 'react';
import { View, Text } from 'react-native';
import { InfoCard, SetPill } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';

type Exercise = {
  id: string;
  name: string;
  sets: number | string;
  reps: string;
  rest: number;
  muscleGroups: string[];
};

type Props = {
  exercise: Exercise;
  totalSets: number;
  currentSet: number;
  restSeconds: number;
};

export function ExerciseCard({ exercise, totalSets, currentSet, restSeconds }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const infoLine = `Series: ${totalSets} · Reps objetivo: ${exercise.reps} · Descanso: ${exercise.rest}s`;

  return (
    <InfoCard variant="compact" className="mx-4 mb-4">
      <View className="gap-3">
        <Text className="text-lg font-bold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
          {exercise.name}
        </Text>
        <Text className="text-[13px] font-medium" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
          {infoLine}
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {Array.from({ length: totalSets }).map((_, index) => {
            const setNumber = index + 1;
            const done = setNumber < currentSet;
            const isCurrent = setNumber === currentSet;
            return (
              <View key={setNumber} className="mr-1">
                <SetPill setNumber={setNumber} done={done} current={isCurrent} />
              </View>
            );
          })}
        </View>

        {restSeconds > 0 ? (
          <Text className="text-[13px] font-medium" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
            Descanso restante: {restSeconds}s
          </Text>
        ) : null}

        {exercise.muscleGroups?.length ? (
          <View className="flex-row flex-wrap gap-2">
            {exercise.muscleGroups.slice(0, 4).map((group) => (
              <View
                key={group}
                className="px-3 py-1 rounded-full"
                style={{
                  backgroundColor: isDark ? 'rgba(79, 70, 229, 0.22)' : 'rgba(129, 140, 248, 0.15)',
                }}
              >
                <Text
                  className="text-[11px] font-semibold uppercase"
                  style={{ color: isDark ? '#C7D2FE' : '#4338CA', letterSpacing: 0.6 }}
                >
                  {group}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </InfoCard>
  );
}
