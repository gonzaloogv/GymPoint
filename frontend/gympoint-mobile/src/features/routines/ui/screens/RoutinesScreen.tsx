import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useRoutines } from '@features/routines/hooks/useRoutine';
import { Routine } from '@features/routines/domain/entities';
import { RoutinesLayout } from '@features/routines/ui/layouts/RoutinesLayout';
import { ItemPad, ProgressWrap } from '@shared/components/ui';
import RoutinesHeader from '@features/routines/ui/components/RoutinesHeader';
import RoutineProgress from '@features/routines/ui/components/RoutineProgress';
import RoutineCard from '@features/routines/ui/components/RoutineCard';
import EmptyState from '@features/routines/ui/components/EmptyState';
import ErrorState from '@features/routines/ui/components/ErrorState';
import FloatingActions from '@features/routines/ui/components/FloatingActions';

// Tipado local del stack de Rutinas (evita depender del RootNavigator)
type RoutinesStackParamList = {
  RoutinesList: undefined;
  RoutineDetail: { id: string };
  RoutineHistory: { id: string };
  RoutineExecution: { id: string };
};
type RoutinesNav = NativeStackNavigationProp<RoutinesStackParamList>;

export default function RoutinesScreen() {
  const { state, setSearch, setStatus } = useRoutines();
  const navigation = useNavigation<RoutinesNav>();

  if (state.error) return <ErrorState />;

  const renderItem = useCallback(
    ({ item }: { item: Routine }) => (
      <ItemPad>
        <RoutineCard
          routine={item}
          onPress={() => navigation.navigate('RoutineDetail', { id: item.id })}
        />
      </ItemPad>
    ),
    [navigation],
  );

  const keyExtractor = useCallback((item: Routine) => item.id, []);

  const headerComponent = (
    <>
      <RoutinesHeader
        search={state.search}
        onSearchChange={setSearch}
        status={state.status}
        onStatusChange={setStatus}
      />
      <ProgressWrap>
        <RoutineProgress completed={3} goal={4} />
      </ProgressWrap>
    </>
  );

  return (
    <>
      <RoutinesLayout
        data={state.list}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={headerComponent}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={{ paddingBottom: 96 }}
      />
      <FloatingActions onCreate={() => {}} onImport={() => {}} />
    </>
  );
}
