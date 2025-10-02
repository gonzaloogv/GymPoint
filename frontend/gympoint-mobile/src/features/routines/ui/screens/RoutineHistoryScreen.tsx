import React from 'react';
import { useRoutineById } from '@features/routines/hooks/useRoutineById';
import { useRoutineHistory } from '@features/routines/hooks/useRoutineHistory';
import { RoutineSession } from '@features/routines/types';
import { HistoryLayout } from '@features/routines/ui/layouts/HistoryLayout';
import { HistoryHeader } from '@features/routines/ui/headers/HistoryHeader';
import { HistoryList } from '@features/routines/ui/lists/HistoryList';


export default function RoutineHistoryScreen({ route }: any) {
  const id = route?.params?.id as string | undefined;
  const routine = useRoutineById(id);
  const { items } = useRoutineHistory(routine.id);

  const historyList = HistoryList({ sessions: items });

  const headerComponent = (
    <HistoryHeader routineName={routine.name} sessionsCount={items.length} />
  );

  return (
    <HistoryLayout
      data={items}
      keyExtractor={historyList.keyExtractor}
      renderItem={historyList.renderItem}
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}
