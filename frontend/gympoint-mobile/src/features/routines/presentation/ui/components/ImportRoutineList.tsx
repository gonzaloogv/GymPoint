import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
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
      <View style={styles.emptyWrapper}>
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </View>
    );
  }

  return (
    <FlatList
      data={routines}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ImportRoutineCard routine={item} onImport={onImport} />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={<View style={styles.footerSpacing} />}
    />
  );
}

const styles = StyleSheet.create({
  emptyWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  footerSpacing: {
    height: 8,
  },
});
