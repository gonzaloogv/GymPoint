import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import type { Routine } from '@features/routines/domain/entities';

type Props = {
  routine: Routine;
  showExercisesTitle?: boolean;
};

export function RoutineDetailHeader({ routine, showExercisesTitle = true }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';
  const subtextColor = isDark ? '#9ca3af' : '#6b7280';

  const exerciseCount = routine.exercises?.length || 0;

  return (
    <>
      <View className="p-4 gap-1">
        <Text className="text-2xl font-black" style={{ color: textColor }}>
          {routine.routine_name}
        </Text>
        {routine.description && (
          <Text style={{ color: subtextColor, fontSize: 14, marginTop: 4 }}>
            {routine.description}
          </Text>
        )}
        <View className="flex-row flex-wrap gap-1 items-center mt-2">
          <Text style={{ color: subtextColor, fontSize: 12 }}>
            {exerciseCount} ejercicio{exerciseCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
      {showExercisesTitle && (
        <Text
          className="font-bold py-1 px-4"
          style={{ color: textColor, fontSize: 18, marginVertical: 4 }}
        >
          Ejercicios
        </Text>
      )}
    </>
  );
}
