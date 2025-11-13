import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { StepScrollContainer, StepSection } from '@shared/components/ui';

type BasicInfo = {
  name: string;
  objective: string;
  muscleGroups: string[];
};

type ExerciseForm = {
  id_exercise: number;
  name: string;
  series: number;
  reps: number;
};

type Props = {
  basicInfo: BasicInfo;
  exercises: ExerciseForm[];
};

export function ReviewStep({ basicInfo, exercises }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const card = isDark ? '#111827' : '#ffffff';
  const border = isDark ? 'rgba(75, 85, 99, 0.6)' : '#E5E7EB';
  const label = isDark ? '#F9FAFB' : '#111827';
  const helper = isDark ? '#9CA3AF' : '#6B7280';
  const tagBg = isDark ? 'rgba(79, 70, 229, 0.12)' : 'rgba(79, 70, 229, 0.08)';
  const tagText = isDark ? '#C7D2FE' : '#4338CA';
  const rowBg = isDark ? '#0F172A' : '#F3F4F6';

  return (
    <StepScrollContainer>
      <StepSection>
        <Text className="text-base font-bold mb-3.5" style={{ color: label }}>
          Informacion general
        </Text>
        <View
          className="border rounded-[22px] px-[18px] py-5 gap-3.5"
          style={{ backgroundColor: card, borderColor: border }}
        >
          <View className="flex-row items-center justify-between">
            <Text
              className="text-[13px] font-semibold uppercase"
              style={{ color: helper, letterSpacing: 0.4 }}
            >
              Nombre
            </Text>
            <Text className="text-sm font-semibold" style={{ color: label }}>
              {basicInfo.name || 'Sin nombre'}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text
              className="text-[13px] font-semibold uppercase"
              style={{ color: helper, letterSpacing: 0.4 }}
            >
              Objetivo
            </Text>
            <Text className="text-sm font-semibold" style={{ color: label }}>
              {basicInfo.objective || 'No definido'}
            </Text>
          </View>

          <Text
            className="text-[13px] font-semibold uppercase"
            style={{ color: helper, letterSpacing: 0.4 }}
          >
            Grupos musculares
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {basicInfo.muscleGroups.length > 0 ? (
              basicInfo.muscleGroups.map((group) => (
                <View
                  key={group}
                  className="rounded-[14px] px-2.5 py-1.5"
                  style={{ backgroundColor: tagBg }}
                >
                  <Text
                    className="text-xs font-bold uppercase"
                    style={{ color: tagText, letterSpacing: 0.4 }}
                  >
                    {group}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-sm font-semibold" style={{ color: label }}>
                No seleccionados
              </Text>
            )}
          </View>
        </View>
      </StepSection>

      <StepSection>
        <Text className="text-base font-bold mb-3.5" style={{ color: label }}>
          Ejercicios ({exercises.length})
        </Text>
        <View
          className="border rounded-[22px] px-[18px] py-5 gap-3.5"
          style={{ backgroundColor: card, borderColor: border }}
        >
          {exercises.length === 0 ? (
            <View className="py-6">
              <Text className="text-center text-sm" style={{ color: helper }}>
                Todavia no agregaste ejercicios.
              </Text>
            </View>
          ) : (
            exercises.map((exercise, index) => (
              <View
                key={exercise.id_exercise}
                className="rounded-2xl px-4 py-3.5 mb-3 gap-1.5"
                style={{ backgroundColor: rowBg }}
              >
                <Text className="text-[15px] font-bold" style={{ color: label }}>
                  {index + 1}. {exercise.name || 'Sin nombre'}
                </Text>
                <Text className="text-[13px] font-medium" style={{ color: helper }}>
                  {exercise.series} series - {exercise.reps} repeticiones
                </Text>
              </View>
            ))
          )}
        </View>
      </StepSection>
    </StepScrollContainer>
  );
}

