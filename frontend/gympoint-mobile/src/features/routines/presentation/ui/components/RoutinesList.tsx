import React from 'react';
import { FlatList, View } from 'react-native';
import type { Routine } from '@features/routines/domain/entities';
import { RoutineCard } from './RoutineCard';

type Props = {
  routines: Routine[];
};

export default function RoutinesList({ routines }: Props) {
  return (
    <FlatList
      data={routines}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RoutineCard routine={item} />}
      contentContainerClassName="px-4 pb-6"
      ItemSeparatorComponent={() => <View className="h-4" />}
      showsVerticalScrollIndicator={false}
    />
  );
}

