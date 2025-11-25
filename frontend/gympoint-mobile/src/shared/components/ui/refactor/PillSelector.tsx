import React from 'react';
import { View, Pressable, Text, ScrollView } from 'react-native';
import { useTheme } from '@shared/hooks';

interface PillOption<T = string> {
  value: T;
  label: string;
}

interface PillSelectorProps<T = string> {
  options: PillOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  /** Color de fondo del pill seleccionado (default: blue-500) */
  activeColor?: string;
  /** Clases adicionales para el contenedor */
  className?: string;
}

/**
 * PillSelector - Selector horizontal de pills/tabs
 *
 * Componente genérico para seleccionar entre múltiples opciones en formato pill.
 * Útil para filtros, períodos de tiempo, categorías, etc.
 *
 * @example
 * ```tsx
 * const periods = [
 *   { value: '7d', label: '7 días' },
 *   { value: '30d', label: '30 días' },
 *   { value: '90d', label: '90 días' }
 * ];
 *
 * <PillSelector
 *   options={periods}
 *   selected="30d"
 *   onSelect={(value) => console.log(value)}
 * />
 * ```
 */
export function PillSelector<T = string>({
  options,
  selected,
  onSelect,
  activeColor = 'bg-blue-500',
  className = '',
}: PillSelectorProps<T>) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={`mb-4 ${className}`}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {options.map((option) => {
        const isSelected = selected === option.value;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onSelect(option.value)}
            className={`px-4 py-2 rounded-full min-w-max ${
              isSelected
                ? activeColor
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
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
