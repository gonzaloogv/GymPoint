import { View, Text } from 'react-native';
import { Card, MetaChip, Button } from '@shared/components/ui';
import { useTheme } from '@shared/hooks';
import { PredesignedRoutine } from '@features/routines/domain/entities/PredesignedRoutine';

type Props = {
  routine: PredesignedRoutine;
  onImport: (routine: PredesignedRoutine) => void;
};

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'Principiante':
      return '#10B981';
    case 'Intermedio':
      return '#F59E0B';
    default:
      return '#EF4444';
  }
};

export function ImportRoutineCard({ routine, onImport }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const metaColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#ffffff' : '#000000';

  const durationLabel =
    routine.duration >= 60
      ? `${Math.floor(routine.duration / 60)}h ${routine.duration % 60}m`
      : `${routine.duration} min`;

  return (
    <Card>
      <View className="flex-row p-4 gap-1 items-start">
        <View
          className="w-12 h-12 rounded-md items-center justify-center"
          style={{ backgroundColor: borderColor }}
        >
          <Text className="text-xl">💪</Text>
        </View>

        <View className="flex-1 gap-0.5">
          <Text className="text-lg font-bold" style={{ color: textColor }}>
            {routine.name}
          </Text>
          <Text className="text-sm font-semibold" style={{ color: getDifficultyColor(routine.difficulty) }}>
            {routine.difficulty}
          </Text>

          <View className="flex-row items-center gap-1 mt-0.5">
            <Text className="text-xs" style={{ color: metaColor }}>
              ⏱ {durationLabel}
            </Text>
            <Text className="text-xs" style={{ color: metaColor }}>
              • {routine.exerciseCount} ejercicios
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-1">
            {routine.muscleGroups.map((group) => (
              <MetaChip key={group}>{group}</MetaChip>
            ))}
          </View>
        </View>

        <Button
          variant="primary"
          onPress={() => onImport(routine)}
          className="px-2.5 py-1.5"
        >
          <Text className="text-xs font-semibold text-white">Importar</Text>
        </Button>
      </View>
    </Card>
  );
}
