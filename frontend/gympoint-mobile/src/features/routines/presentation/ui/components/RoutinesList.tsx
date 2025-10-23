import { FlatList, View } from 'react-native';
import type { Routine } from '@features/routines/domain/entities';
import { RoutineCard } from './RoutineCard';

type Props = { routines: Routine[] };

export default function RoutinesList({ routines }: Props) {
  return (
    <View className="px-4">
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RoutineCard routine={item} />}
        ItemSeparatorComponent={() => <View className="h-1.5" />}
      />
    </View>
  );
}
