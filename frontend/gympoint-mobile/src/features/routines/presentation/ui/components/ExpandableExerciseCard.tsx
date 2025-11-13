import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { InfoCard } from '@shared/components/ui';
import { Exercise } from '@features/routines/domain/entities/Exercise';
import { SetExecution } from '@features/routines/domain/entities/ExecutionSession';
import { ExerciseSetTable } from './ExerciseSetTable';

type Props = {
  exercise: Exercise;
  isExpanded: boolean;
  onToggleExpand: () => void;
  sets: SetExecution[];
  onUpdateSet: (setIndex: number, data: Partial<SetExecution>) => void;
  onAddSet: () => void;
  onMarkSetDone: (setIndex: number) => void;
};

export function ExpandableExerciseCard({
  exercise,
  isExpanded,
  onToggleExpand,
  sets,
  onUpdateSet,
  onAddSet,
  onMarkSetDone,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const completedSets = sets.filter((s) => s.isDone).length;
  const totalSets = sets.length;
  const exerciseVolume = sets.reduce((sum, set) => {
    if (set.isDone) {
      return sum + set.currentWeight * set.currentReps;
    }
    return sum;
  }, 0);

  return (
    <View className="mb-4">
      <InfoCard variant="compact" className="p-0">
        <TouchableOpacity onPress={onToggleExpand} activeOpacity={0.75}>
          <View className="flex-row items-center justify-between px-5 py-4">
          <View className="flex-1 pr-3 gap-1.5">
            <Text
              numberOfLines={1}
              className="text-lg font-bold"
              style={{ color: isDark ? '#F9FAFB' : '#111827' }}
            >
              {exercise.name}
            </Text>
            <View className="flex-row flex-wrap gap-1.5">
              {totalSets > 0 ? (
                <View
                  className="px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(129, 140, 248, 0.18)'
                      : 'rgba(79, 70, 229, 0.12)',
                  }}
                >
                  <Text
                    className="text-[11px] font-semibold uppercase"
                    style={{
                      color: isDark ? '#C7D2FE' : '#4338CA',
                      letterSpacing: 0.6,
                    }}
                  >
                    {completedSets}/{totalSets} series
                  </Text>
                </View>
              ) : null}
              {exerciseVolume > 0 ? (
                <View
                  className="px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(129, 140, 248, 0.18)'
                      : 'rgba(79, 70, 229, 0.12)',
                  }}
                >
                  <Text
                    className="text-[11px] font-semibold uppercase"
                    style={{
                      color: isDark ? '#C7D2FE' : '#4338CA',
                      letterSpacing: 0.6,
                    }}
                  >
                    {exerciseVolume.toFixed(0)} kg
                  </Text>
                </View>
              ) : null}
              {exercise.rest > 0 ? (
                <View
                  className="px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(129, 140, 248, 0.18)'
                      : 'rgba(79, 70, 229, 0.12)',
                  }}
                >
                  <Text
                    className="text-[11px] font-semibold uppercase"
                    style={{
                      color: isDark ? '#C7D2FE' : '#4338CA',
                      letterSpacing: 0.6,
                    }}
                  >
                    Descanso {exercise.rest}s
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </View>
      </TouchableOpacity>

      {isExpanded ? (
        <View
          className="px-4 pt-3 pb-4 border-t"
          style={{
            borderTopColor: isDark ? 'rgba(55, 65, 81, 0.6)' : 'rgba(148, 163, 184, 0.3)',
          }}
        >
          <ExerciseSetTable
            sets={sets}
            onUpdateSet={onUpdateSet}
            onAddSet={onAddSet}
            onMarkSetDone={onMarkSetDone}
          />
        </View>
      ) : null}
      </InfoCard>
    </View>
  );
}
