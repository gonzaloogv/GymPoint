import React, { useState } from 'react';
import { ActivityIndicator, Text, View, TouchableOpacity } from 'react-native';
import { SurfaceScreen, BackButton } from '@shared/components/ui';
import { useRoutineById } from '@features/routines/presentation/hooks/useRoutineById';
import { useRoutineHistory } from '@features/routines/presentation/hooks/useRoutineHistory';
import { HistoryLayout } from '@features/routines/presentation/ui/layouts/HistoryLayout';
import { HistoryHeader } from '@features/routines/presentation/ui/headers/HistoryHeader';
import { HistoryList } from '@features/routines/presentation/ui/lists/HistoryList';
import { DateFilter, getDateRangeFromFilter } from '@features/routines/presentation/ui/components/DateFilter';
import { useTheme } from '@shared/hooks';

type RoutineHistoryScreenProps = {
  route: { params?: { id?: string } };
  navigation?: any;
};

type FilterOption = 'all' | 'week' | 'month' | 'custom';

export default function RoutineHistoryScreen({ route, navigation }: RoutineHistoryScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const idParam = route?.params?.id;
  const routineId = idParam ? parseInt(idParam, 10) : undefined;

  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');

  const { routine, loading: loadingRoutine } = useRoutineById(routineId);
  const { items, loading: loadingHistory, hasMore, loadMore, setDateFilter } = useRoutineHistory(routineId);

  // Call HistoryList before any early returns to maintain hook order
  const historyList = HistoryList({ sessions: items });

  const handleFilterChange = (filter: FilterOption) => {
    setSelectedFilter(filter);
    const dateRange = getDateRangeFromFilter(filter);
    setDateFilter(dateRange.start_date, dateRange.end_date);
  };
  const handleBackPress = () => navigation?.goBack?.();

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

  const header = (
    <View className="gap-4">
      {navigation && (
        <View className="pt-4 px-4">
          <BackButton onPress={handleBackPress} />
        </View>
      )}
      <HistoryHeader
        routineName={routine?.routine_name || 'Rutina'}
        sessionsCount={items.length}
        loading={loadingHistory}
      />
      <DateFilter selectedFilter={selectedFilter} onFilterChange={handleFilterChange} />
    </View>
  );

  const footer = hasMore ? (
    <View className="mt-4 mb-8">
      <TouchableOpacity
        onPress={loadMore}
        disabled={loadingHistory}
        className="py-3 px-6 rounded-xl items-center"
        style={{
          backgroundColor: isDark ? '#4F46E5' : '#6366F1',
          opacity: loadingHistory ? 0.5 : 1,
        }}
        activeOpacity={0.7}
      >
        {loadingHistory ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text className="text-white text-base font-semibold">Ver más</Text>
        )}
      </TouchableOpacity>
    </View>
  ) : items.length > 0 ? (
    <View className="mt-4 mb-8 items-center">
      <Text
        className="text-sm font-medium"
        style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
      >
        No hay más entrenamientos
      </Text>
    </View>
  ) : null;

  return (
    <SurfaceScreen>
      <HistoryLayout
        data={items}
        keyExtractor={historyList.keyExtractor}
        renderItem={historyList.renderItem}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
      />
    </SurfaceScreen>
  );
}
