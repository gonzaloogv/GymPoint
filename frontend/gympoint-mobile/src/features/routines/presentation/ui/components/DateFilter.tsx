import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@shared/hooks';

type FilterOption = 'all' | 'week' | 'month' | 'custom';

type Props = {
  selectedFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
};

export function DateFilter({ selectedFilter, onFilterChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = isDark ? '#1F2937' : '#F3F4F6';
  const selectedBg = isDark ? '#4F46E5' : '#6366F1';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const selectedText = '#FFFFFF';

  const filters: Array<{ value: FilterOption; label: string }> = [
    { value: 'all', label: 'Todos' },
    { value: 'week', label: 'Última semana' },
    { value: 'month', label: 'Último mes' },
  ];

  const getDateRange = (filter: FilterOption): { start_date?: string; end_date?: string } => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (filter) {
      case 'week': {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { start_date: weekAgo.toISOString().split('T')[0], end_date: today };
      }
      case 'month': {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return { start_date: monthAgo.toISOString().split('T')[0], end_date: today };
      }
      case 'all':
      default:
        return {};
    }
  };

  const handlePress = (filter: FilterOption) => {
    onFilterChange(filter);
  };

  return (
    <View className="mb-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0, gap: 8 }}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            onPress={() => handlePress(filter.value)}
            className="px-4 py-2 rounded-full"
            style={{
              backgroundColor: selectedFilter === filter.value ? selectedBg : bgColor,
            }}
            activeOpacity={0.7}
          >
            <Text
              className="text-sm font-semibold"
              style={{
                color: selectedFilter === filter.value ? selectedText : textColor,
              }}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export function getDateRangeFromFilter(filter: FilterOption): { start_date?: string; end_date?: string } {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  switch (filter) {
    case 'week': {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { start_date: weekAgo.toISOString().split('T')[0], end_date: today };
    }
    case 'month': {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return { start_date: monthAgo.toISOString().split('T')[0], end_date: today };
    }
    case 'all':
    default:
      return {};
  }
}
