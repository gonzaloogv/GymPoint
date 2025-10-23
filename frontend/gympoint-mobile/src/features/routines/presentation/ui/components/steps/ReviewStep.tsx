import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { StepScrollContainer, StepSection } from '@shared/components/ui';
import { Exercise } from '@features/routines/domain/entities/Exercise';

type BasicInfo = {
  name: string;
  objective: string;
  muscleGroups: string[];
};

type Props = {
  basicInfo: BasicInfo;
  exercises: Exercise[];
};

export function ReviewStep({ basicInfo, exercises }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  const subtextColor = isDark ? '#9ca3af' : '#6b7280';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const bgColor = isDark ? '#111827' : '#f9fafb';

  return (
    <StepScrollContainer>
      <StepSection>
        <Text className="text-sm font-semibold mb-1.5" style={{ color: textColor }}>
          Información general
        </Text>
        <View
          className="rounded-lg p-5 mb-4 border"
          style={{
            backgroundColor: cardBg,
            borderColor: borderColor,
            borderWidth: 1,
          }}
        >
          <View className="flex-row justify-between mb-1.5">
            <Text style={{ color: subtextColor, fontSize: 14, fontWeight: '500' }}>
              Nombre
            </Text>
            <Text className="font-semibold" style={{ color: textColor, fontSize: 14 }}>
              {basicInfo.name || 'Sin nombre'}
            </Text>
          </View>
          <View className="flex-row justify-between mb-1.5">
            <Text style={{ color: subtextColor, fontSize: 14, fontWeight: '500' }}>
              Objetivo
            </Text>
            <Text className="font-semibold" style={{ color: textColor, fontSize: 14 }}>
              {basicInfo.objective || 'No definido'}
            </Text>
          </View>
          <Text style={{ color: subtextColor, fontSize: 14, fontWeight: '500' }}>
            Grupos musculares
          </Text>
          <View className="flex-row flex-wrap gap-2 mt-1">
            {basicInfo.muscleGroups.length > 0 ? (
              basicInfo.muscleGroups.map((group) => (
                <View
                  key={group}
                  className="rounded-lg px-3.5 py-2"
                  style={{ backgroundColor: '#3B82F61A' }}
                >
                  <Text className="text-xs font-semibold" style={{ color: '#3B82F6' }}>
                    {group}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="font-semibold" style={{ color: textColor, fontSize: 14 }}>
                No seleccionados
              </Text>
            )}
          </View>
        </View>
      </StepSection>

      <StepSection>
        <Text className="text-sm font-semibold mb-1.5" style={{ color: textColor }}>
          Ejercicios ({exercises.length})
        </Text>
        <View
          className="rounded-lg border"
          style={{
            backgroundColor: cardBg,
            borderColor: borderColor,
            borderWidth: 1,
          }}
        >
          {exercises.length === 0 ? (
            <View className="p-5">
              <Text className="font-semibold text-center" style={{ color: textColor, fontSize: 14 }}>
                No hay ejercicios agregados
              </Text>
            </View>
          ) : (
            exercises.map((exercise, index) => (
              <View
                key={exercise.id}
                className="p-4 rounded-lg mb-1.5"
                style={{ backgroundColor: bgColor }}
              >
                <Text className="font-semibold mb-1.5" style={{ color: textColor, fontSize: 15 }}>
                  {index + 1}. {exercise.name || 'Sin nombre'}
                </Text>
                <Text style={{ color: subtextColor, fontSize: 13 }}>
                  {exercise.sets} series × {exercise.reps} reps
                </Text>
              </View>
            ))
          )}
        </View>
      </StepSection>
    </StepScrollContainer>
  );
}
