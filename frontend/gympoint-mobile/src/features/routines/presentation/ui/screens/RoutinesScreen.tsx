import { useCallback, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';

import { useRoutines } from '@features/routines/presentation/hooks/useRoutine';
import { Routine } from '@features/routines/domain/entities';
import { RoutinesLayout } from '@features/routines/presentation/ui/layouts/RoutinesLayout';
import RoutinesHeader from '@features/routines/presentation/ui/components/RoutinesHeader';
import WeeklyProgressCard from '@features/home/presentation/ui/components/WeeklyProgressCard';
import { RoutineCard } from '../components/RoutineCard';
import EmptyState from '@features/routines/presentation/ui/components/EmptyState';
import ErrorState from '@features/routines/presentation/ui/components/ErrorState';
import FloatingActions from '@features/routines/presentation/ui/components/FloatingActions';
import { useHomeStore } from '@features/home/presentation/state/home.store';
import { SurfaceScreen } from '@shared/components/ui';

// Tipado local del stack de Rutinas (evita depender del RootNavigator)
type RoutinesStackParamList = {
  RoutinesList: undefined;
  CreateRoutine: undefined;
  ImportRoutine: undefined;
  RoutineDetail: { id: string };
  RoutineHistory: { id: string };
  RoutineExecution: { id: string };
};
type RoutinesNav = NativeStackNavigationProp<RoutinesStackParamList>;

export default function RoutinesScreen() {
  const { state, setSearch, setStatus } = useRoutines();
  const navigation = useNavigation<RoutinesNav>();
  const { user, weeklyProgress, fetchHomeData } = useHomeStore();

  // Fetch home data to get weekly progress
  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  // Calculate progress percentage
  const progressPct = weeklyProgress
    ? (weeklyProgress.current / weeklyProgress.goal) * 100
    : 0;

  if (state.error) return <ErrorState />;

  const renderItem = useCallback(
    ({ item }: { item: Routine }) => (
      <RoutineCard
        routine={item}
        onPressDetail={() => navigation.navigate('RoutineDetail', { id: item.id_routine.toString() })}
        onPressStart={() => navigation.navigate('RoutineExecution', { id: item.id_routine.toString() })}
      />
    ),
    [navigation],
  );

  const keyExtractor = useCallback((item: Routine) => item.id_routine.toString(), []);

  const headerComponent = useMemo(() => {
    const weeklyCurrent = weeklyProgress?.current || 0;
    const weeklyGoal = weeklyProgress?.goal || 4;
    const weeklyStreak = user?.streak || 0;

    return (
      <View>
        <RoutinesHeader
          search={state.search}
          onSearchChange={setSearch}
          status={state.status}
          onStatusChange={setStatus}
        />
        <View style={styles.weeklyCardWrapper}>
          <WeeklyProgressCard
            current={weeklyCurrent}
            goal={weeklyGoal}
            progressPct={progressPct}
            streak={weeklyStreak}
          />
        </View>
      </View>
    );
  }, [
    progressPct,
    setSearch,
    setStatus,
    state.search,
    state.status,
    user?.streak,
    weeklyProgress?.current,
    weeklyProgress?.goal,
  ]);

  return (
    <SurfaceScreen>
      <RoutinesLayout
        data={state.list}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={headerComponent}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={styles.contentSpacing}
      />
      <FloatingActions
        onCreate={() => navigation.navigate('CreateRoutine')}
        onImport={() => navigation.navigate('ImportRoutine')}
      />
    </SurfaceScreen>
  );
}

const styles = StyleSheet.create({
  weeklyCardWrapper: {
    marginTop: 28,
    marginBottom: 32,
  },
  contentSpacing: {
    paddingBottom: 140,
  },
});
