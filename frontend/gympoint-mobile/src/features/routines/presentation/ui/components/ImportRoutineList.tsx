import { FlatList, View } from 'react-native';
import styled from 'styled-components/native';
import { ImportRoutineCard } from './ImportRoutineCard';
import { PredesignedRoutine } from '@features/routines/domain/entities/PredesignedRoutine';
import { EmptyState } from '@shared/components/ui';

const ListContainer = styled(FlatList<PredesignedRoutine>).attrs({
  contentContainerStyle: { padding: 16, paddingBottom: 32 },
})`
  flex: 1;
`;

const Separator = styled(View)`
  height: 12px;
`;

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
    <ListContainer
      data={routines}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ImportRoutineCard routine={item} onImport={onImport} />
      )}
      ItemSeparatorComponent={Separator}
      showsVerticalScrollIndicator={false}
    />
  );
}
