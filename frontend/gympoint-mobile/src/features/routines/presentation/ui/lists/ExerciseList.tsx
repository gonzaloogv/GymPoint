import { View, Text } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Card, MetaChip } from '@shared/components/ui';
import type { Exercise } from '@features/routines/domain/entities';

type Props = {
  exercises: Exercise[];
};

export function ExerciseList({ exercises }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const renderItem = ({ item }: { item: Exercise }) => (
    <Card className="mx-4">
      <View className="p-2 gap-1">
        <View className="py-1">
          <Text className={`font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
            {item.name}
          </Text>
          <Text className={`text-sm ${isDark ? 'text-subtext-dark' : 'text-subtext'}`}>
            {`Series: ${item.sets} • Reps: ${item.reps} • Descanso: ${item.rest}s`}
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-1">
          {item.muscleGroups.map((m) => (
            <MetaChip key={m}>{m}</MetaChip>
          ))}
        </View>
      </View>
    </Card>
  );

  const keyExtractor = (item: Exercise) => item.id;

  const ItemSeparatorComponent = () => (
    <View className={`h-px my-1 ${isDark ? 'bg-border-dark' : 'bg-border'}`} />
  );

  return {
    renderItem,
    keyExtractor,
    ItemSeparatorComponent,
  };
}
