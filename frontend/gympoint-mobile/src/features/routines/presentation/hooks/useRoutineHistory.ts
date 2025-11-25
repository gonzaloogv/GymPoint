import { useEffect } from 'react';
import { useRoutinesStore } from '../state';

export function useRoutineHistory(routineId?: number) {
  const {
    history,
    loadingHistory,
    historyHasMore,
    historyFilters,
    fetchRoutineHistory,
    loadMoreHistory,
    setHistoryDateFilter,
  } = useRoutinesStore();

  useEffect(() => {
    if (routineId !== undefined) {
      fetchRoutineHistory(routineId, true);
    }
  }, [routineId, historyFilters.startDate, historyFilters.endDate]);

  // Sort by date descending
  const items = history.sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const handleLoadMore = () => {
    if (routineId !== undefined && historyHasMore && !loadingHistory) {
      loadMoreHistory(routineId);
    }
  };

  const handleSetDateFilter = (startDate?: string, endDate?: string) => {
    setHistoryDateFilter(startDate, endDate);
    if (routineId !== undefined) {
      fetchRoutineHistory(routineId, true);
    }
  };

  return {
    items,
    loading: loadingHistory,
    hasMore: historyHasMore,
    filters: historyFilters,
    loadMore: handleLoadMore,
    setDateFilter: handleSetDateFilter,
  };
}
