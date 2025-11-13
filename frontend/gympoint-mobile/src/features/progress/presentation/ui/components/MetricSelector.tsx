import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';

export type MetricType = 'weight' | 'bodyFat' | 'bmi' | 'muscleMass' | 'measurements';

interface MetricOption {
  type: MetricType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const METRIC_OPTIONS: MetricOption[] = [
  { type: 'weight', label: 'Peso', icon: 'scale' },
  { type: 'bodyFat', label: '% Grasa', icon: 'water' },
  { type: 'bmi', label: 'IMC', icon: 'bar-chart' },
  { type: 'muscleMass', label: 'Masa Muscular', icon: 'fitness' },
  { type: 'measurements', label: 'Medidas', icon: 'resize' },
];

interface MetricSelectorProps {
  selected: MetricType;
  onSelect: (metric: MetricType) => void;
}

export function MetricSelector({ selected, onSelect }: MetricSelectorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4"
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      {METRIC_OPTIONS.map((option, index) => {
        const isSelected = selected === option.type;

        return (
          <Pressable
            key={option.type}
            onPress={() => onSelect(option.type)}
            className={`flex-row items-center px-4 py-2.5 rounded-full mr-3 ${
              isSelected
                ? 'bg-blue-500'
                : isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-gray-100 border border-gray-200'
            }`}
            style={{ minWidth: 100 }}
          >
            <Ionicons
              name={option.icon}
              size={18}
              color={
                isSelected
                  ? '#FFFFFF'
                  : isDark
                  ? '#9CA3AF'
                  : '#6B7280'
              }
            />
            <Text
              className={`ml-2 font-semibold text-sm ${
                isSelected
                  ? 'text-white'
                  : isDark
                  ? 'text-gray-300'
                  : 'text-gray-700'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
