import React from 'react';
import { useRoutineById } from '../hooks/useRoutineById';
import { useRoutineHistory } from '../hooks/useRoutineHistory';
import { RoutineSession } from '../types';
import { HistoryLayout } from './layouts';
import { HistoryHeader } from './headers';
import { HistoryList } from './lists';


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
