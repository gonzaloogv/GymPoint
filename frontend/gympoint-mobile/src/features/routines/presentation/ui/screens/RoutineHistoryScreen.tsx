import { useRoutineById } from '@features/routines/presentation/hooks/useRoutineById';
import { useRoutineHistory } from '@features/routines/presentation/hooks/useRoutineHistory';
import { HistoryLayout } from '@features/routines/presentation/ui/layouts/HistoryLayout';
import { HistoryHeader } from '@features/routines/presentation/ui/headers/HistoryHeader';
import { HistoryList } from '@features/routines/presentation/ui/lists/HistoryList';


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
