import { FlatList, View } from 'react-native';
import { ImportRoutineCard } from './ImportRoutineCard';
import { PredesignedRoutine } from '@features/routines/domain/entities/PredesignedRoutine';
import { EmptyState } from '@shared/components/ui';

type Props = {
  routines: PredesignedRoutine[];
  onImport: (routine: PredesignedRoutine) => void;
  emptyTitle: string;
  emptyDescription: string;
};

export function ImportRoutineList({
  routines,
  onImport,
  emptyTitle,
  emptyDescription,
}: Props) {
  if (routines.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <FlatList
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      data={routines}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ImportRoutineCard routine={item} onImport={onImport} />
      )}
      ItemSeparatorComponent={() => <View className="h-3" />}
      showsVerticalScrollIndicator={false}
    />
  );
}
