import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { StatusPill } from '@shared/components/ui';
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

  return (
    <>
      <View className="p-4 gap-1">
        <Text className="text-2xl font-black" style={{ color: textColor }}>
          {routine.name}
        </Text>
        <View className="flex-row flex-wrap gap-1 items-center">
          <StatusPill status={routine.status} />
          <Text style={{ color: subtextColor, fontSize: 12 }}>• {routine.difficulty}</Text>
          <Text style={{ color: subtextColor, fontSize: 12 }}>• {routine.estimatedDuration} min</Text>
          {routine.lastPerformed ? (
            <Text style={{ color: subtextColor, fontSize: 12 }}>• Última: {routine.lastPerformed}</Text>
          ) : null}
          {routine.nextScheduled ? (
            <Text style={{ color: subtextColor, fontSize: 12 }}>• Próxima: {routine.nextScheduled}</Text>
          ) : null}
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
