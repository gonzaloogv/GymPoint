// src/features/routines/ui/RoutinesScreen.tsx
import { useCallback } from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useRoutines } from '../hooks/useRoutine'; // ← fix del import
import { Routine } from '../types';
import RoutinesHeader from './components/RoutinesHeader';
import RoutineProgress from './components/RoutineProgress';
import RoutineCard from './components/RoutineCard';
import EmptyState from './components/EmptyState';
import ErrorState from './components/ErrorState';
import FloatingActions from './components/FloatingActions';
import { Container, ItemPad, ProgressWrap, Separator } from '@shared/components/ui';

// Tipado local del stack de Rutinas (evita depender del RootNavigator)
type RoutinesStackParamList = {
  RoutinesList: undefined;
  RoutineDetail: { id: string };
  RoutineHistory: { id: string };
  RoutineExecution: { id: string };
};
type RoutinesNav = NativeStackNavigationProp<RoutinesStackParamList>;

const HeaderWrap = styled.View``;


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
    [navigation]
  );

  const keyExtractor = useCallback((item: Routine) => item.id, []);

  return (
    <Container edges={['top', 'left', 'right']}>
      <FlatList
        data={state.list}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <Separator />}
        ListHeaderComponent={
          <HeaderWrap>
            <RoutinesHeader
              search={state.search}
              onSearchChange={setSearch}
              status={state.status}
              onStatusChange={setStatus}
            />
            <ProgressWrap>
              <RoutineProgress completed={3} goal={4} />
            </ProgressWrap>
          </HeaderWrap>
        }
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={{ paddingBottom: 96 }}
      />
      <FloatingActions onCreate={() => {}} onImport={() => {}} />
    </Container>
  );
}
