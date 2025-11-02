import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import type { ExerciseHistoryItem } from '../../hooks/useExerciseProgress';

interface ExerciseHistoryListProps {
  history: ExerciseHistoryItem[];
  loading?: boolean;
}

export function ExerciseHistoryList({ history, loading = false }: ExerciseHistoryListProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(5);

  const ITEMS_PER_PAGE = 5;
  const visibleHistory = history.slice(0, itemsToShow);
  const hasMore = itemsToShow < history.length;

  // Reset items to show when history changes (filter applied)
  useEffect(() => {
    setItemsToShow(5);
  }, [history.length]);

  if (loading) {
    return (
      <View
        className={`p-4 rounded-xl border ${
          isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Cargando historial...
        </Text>
      </View>
    );
  }

  if (!history || history.length === 0) {
    return (
      <View
        className={`p-4 rounded-xl border ${
          isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <View className="items-center py-4">
          <Ionicons
            name="bar-chart-outline"
            size={48}
            color={isDark ? '#6B7280' : '#9CA3AF'}
          />
          <Text className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No hay registros disponibles
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      className={`rounded-xl border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Header - Clickable */}
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        className={`p-4 ${isExpanded ? 'border-b' : ''}`}
        style={isExpanded ? { borderBottomColor: isDark ? '#374151' : '#E5E7EB' } : undefined}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1">
            <Ionicons
              name="list"
              size={18}
              color={isDark ? '#60A5FA' : '#3B82F6'}
            />
            <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Historial de entrenamientos
            </Text>
            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              ({history.length})
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </View>
      </Pressable>

      {/* List - Collapsible */}
      {isExpanded && (
        <View className="p-4">
          {visibleHistory.map((item, index) => (
            <View
              key={`${item.date}-${index}`}
              className={`p-3 rounded-lg mb-2 ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <View className={`w-6 h-6 rounded-full items-center justify-center ${
                    index === 0
                      ? 'bg-yellow-500/20'
                      : isDark ? 'bg-gray-600' : 'bg-gray-300'
                  }`}>
                    <Text className={`text-xs font-bold ${
                      index === 0
                        ? 'text-yellow-500'
                        : isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date(item.date).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                {index === 0 && (
                  <View className="flex-row items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded">
                    <Ionicons name="trophy" size={12} color="#EAB308" />
                    <Text className="text-xs font-semibold text-yellow-500">
                      Más reciente
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-row gap-4">
                {/* Peso */}
                <View className="flex-1">
                  <View className="flex-row items-center gap-1 mb-0.5">
                    <Ionicons name="barbell" size={10} color="#EF4444" />
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Peso
                    </Text>
                  </View>
                  <Text className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.used_weight} kg
                  </Text>
                </View>

                {/* Reps */}
                <View className="flex-1">
                  <View className="flex-row items-center gap-1 mb-0.5">
                    <Ionicons name="repeat" size={10} color="#8B5CF6" />
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Reps
                    </Text>
                  </View>
                  <Text className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.reps}
                  </Text>
                </View>

                {/* Volumen */}
                <View className="flex-1">
                  <View className="flex-row items-center gap-1 mb-0.5">
                    <Ionicons name="pulse" size={10} color="#10B981" />
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Volumen
                    </Text>
                  </View>
                  <Text className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.total_volume} kg
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {/* Ver más button */}
          {hasMore && (
            <Pressable
              onPress={() => setItemsToShow(prev => prev + ITEMS_PER_PAGE)}
              className={`mt-4 py-3 px-4 rounded-lg border ${
                isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Text className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  Ver más ({history.length - itemsToShow} restantes)
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={isDark ? '#60A5FA' : '#3B82F6'}
                />
              </View>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
