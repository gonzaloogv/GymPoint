import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { InfoCard } from '@shared/components/ui';
import { RoutineExercise } from '@features/routines/domain/entities/Routine';

type Props = {
  exercise: RoutineExercise;
  isExpanded: boolean;
  onToggle: () => void;
};

export function ExpandableExerciseDetail({ exercise, isExpanded, onToggle }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const background = isDark ? '#111827' : '#ffffff';
  const border = isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB';
  const title = isDark ? '#F9FAFB' : '#111827';
  const subtitle = isDark ? '#9CA3AF' : '#6B7280';
  const pillBg = isDark ? 'rgba(79, 70, 229, 0.22)' : 'rgba(129, 140, 248, 0.16)';
  const pillText = isDark ? '#C7D2FE' : '#4338CA';
  const divider = isDark ? 'rgba(55, 65, 81, 0.6)' : 'rgba(148, 163, 184, 0.35)';

  const series = exercise.series ?? 3;
  const reps = exercise.reps ?? 10;

  return (
    <View className="mb-4">
      <InfoCard variant="compact" className="p-0">
        <TouchableOpacity
          onPress={onToggle}
          activeOpacity={0.75}
          className="flex-row items-center justify-between px-5 py-[18px]"
        >
        <View className="flex-1 pr-3 gap-2">
          <Text
            numberOfLines={1}
            className="text-[18px] font-bold"
            style={{ color: title }}
          >
            {exercise.exercise_name}
          </Text>
          <View
            className="self-start px-2.5 py-1 rounded-full"
            style={{ backgroundColor: pillBg }}
          >
            <Text
              className="text-[11px] font-semibold uppercase"
              style={{ color: pillText, letterSpacing: 0.5 }}
            >
              {series} x {reps} reps
            </Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={subtitle}
        />
      </TouchableOpacity>

      {isExpanded ? (
        <View
          className="px-5 py-4 border-t gap-4"
          style={{ borderTopColor: divider }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="barbell-outline" size={18} color={subtitle} />
              <Text
                className="text-[13px] font-semibold uppercase"
                style={{ color: subtitle, letterSpacing: 0.3 }}
              >
                Grupo muscular
              </Text>
            </View>
            <Text className="text-[14px] font-semibold" style={{ color: title }}>
              {exercise.muscular_group || 'No especificado'}
            </Text>
          </View>

          {exercise.description ? (
            <View className="gap-2">
              <Text
                className="text-[13px] font-semibold uppercase"
                style={{ color: subtitle, letterSpacing: 0.3 }}
              >
                Descripcion
              </Text>
              <Text className="text-[14px] leading-5" style={{ color: title }}>
                {exercise.description}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
      </InfoCard>
    </View>
  );
}

