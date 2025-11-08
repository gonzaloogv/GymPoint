import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SurfaceScreen } from '@shared/components/ui';
import { useRoutineById } from '@features/routines/presentation/hooks/useRoutineById';
import { useRoutineHistory } from '@features/routines/presentation/hooks/useRoutineHistory';
import { HistoryLayout } from '@features/routines/presentation/ui/layouts/HistoryLayout';
import { HistoryHeader } from '@features/routines/presentation/ui/headers/HistoryHeader';
import { HistoryList } from '@features/routines/presentation/ui/lists/HistoryList';
import { useTheme } from '@shared/hooks';

type RoutineHistoryScreenProps = {
  route: { params?: { id?: string } };
};

export default function RoutineHistoryScreen({ route }: RoutineHistoryScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const idParam = route?.params?.id;
  const routineId = idParam ? parseInt(idParam, 10) : undefined;

  const { routine, loading: loadingRoutine } = useRoutineById(routineId);
  const { items, loading: loadingHistory } = useRoutineHistory(routineId);

  if (loadingRoutine || (!routine && !loadingRoutine)) {
    return (
      <SurfaceScreen>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#111827'} />
          {!loadingRoutine && !routine ? (
            <Text className="mt-4" style={{ color: isDark ? '#ffffff' : '#111827' }}>
              Rutina no encontrada
            </Text>
          ) : null}
        </View>
      </SurfaceScreen>
    );
  }

  const historyList = HistoryList({ sessions: items });
  const header = (
    <HistoryHeader
      routineName={routine?.routine_name || 'Rutina'}
      sessionsCount={items.length}
      loading={loadingHistory}
    />
  );

  return (
    <SurfaceScreen>
      <HistoryLayout
        data={items}
        keyExtractor={historyList.keyExtractor}
        renderItem={historyList.renderItem}
        ListHeaderComponent={header}
      />
    </SurfaceScreen>
  );
}
