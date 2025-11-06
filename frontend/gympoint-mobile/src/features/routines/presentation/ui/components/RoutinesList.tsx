import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
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
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  separator: {
    height: 16,
  },
});

