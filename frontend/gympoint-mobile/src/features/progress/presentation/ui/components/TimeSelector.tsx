import React from 'react';
import { View, Pressable, Text, ScrollView } from 'react-native';
import { useTheme } from '@shared/hooks';

interface TimeSelectorProps {
  periods: Array<{ value: '7d' | '30d' | '90d' | '12m'; label: string }>;
  selected: '7d' | '30d' | '90d' | '12m';
  onSelect: (period: '7d' | '30d' | '90d' | '12m') => void;
}

export function TimeSelector({ periods, selected, onSelect }: TimeSelectorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4"
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {periods.map((period) => {
        const isSelected = selected === period.value;
        return (
          <Pressable
            key={period.value}
            onPress={() => onSelect(period.value)}
            className={`px-4 py-2 rounded-full min-w-max ${
              isSelected
                ? 'bg-blue-500'
                : isDark
                  ? 'bg-gray-700 border border-gray-600'
                  : 'bg-gray-100 border border-gray-300'
            }`}
          >
            <Text
              className={`font-semibold text-sm ${
                isSelected ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {period.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
