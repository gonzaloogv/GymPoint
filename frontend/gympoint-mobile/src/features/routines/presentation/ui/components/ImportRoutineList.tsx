import React from 'react';
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
      <View className="flex-1 px-6 py-12">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </View>
    );
  }

  return (
    <FlatList
      data={routines}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ImportRoutineCard routine={item} onImport={onImport} />}
      contentContainerClassName="px-4 pt-4 pb-8"
      showsVerticalScrollIndicator={false}
      ListFooterComponent={<View className="h-2" />}
    />
  );
}
