import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { InfoCard } from '@shared/components/ui';
import type { ExerciseAverages } from '../../hooks/useExerciseProgress';

interface ExerciseAveragesCardProps {
  averages: ExerciseAverages | null;
  loading?: boolean;
}

export function ExerciseAveragesCard({ averages, loading = false }: ExerciseAveragesCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <InfoCard variant="compact">
        <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Cargando promedios...
        </Text>
      </InfoCard>
    );
  }

  if (!averages || averages.total_records === 0) {
    return null;
  }

  return (
    <InfoCard variant="compact">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Ionicons
            name="stats-chart"
            size={18}
            color={isDark ? '#60A5FA' : '#3B82F6'}
          />
          <Text
            className="text-base font-bold"
            style={{ color: isDark ? '#F9FAFB' : '#111827' }}
          >
            Promedios
          </Text>
        </View>
        <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {averages.total_records} {averages.total_records === 1 ? 'registro' : 'registros'}
        </Text>
      </View>

      {/* Stats Grid */}
      <View className="flex-row gap-4">
        {/* Peso promedio */}
        <View className="flex-1">
          <View className="flex-row items-center mb-1 gap-1">
            <Ionicons name="barbell" size={12} color="#EF4444" />
            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Peso
            </Text>
          </View>
          <View className="flex-row items-baseline gap-1">
            <Text
              className="text-lg font-bold"
              style={{ color: isDark ? '#F9FAFB' : '#111827' }}
            >
              {averages.average_weight.toFixed(1)}
            </Text>
            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              kg
            </Text>
          </View>
        </View>

        {/* Reps promedio */}
        <View className="flex-1">
          <View className="flex-row items-center mb-1 gap-1">
            <Ionicons name="repeat" size={12} color="#8B5CF6" />
            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Reps
            </Text>
          </View>
          <Text
            className="text-lg font-bold"
            style={{ color: isDark ? '#F9FAFB' : '#111827' }}
          >
            {averages.average_reps.toFixed(1)}
          </Text>
        </View>

        {/* Volumen promedio */}
        <View className="flex-1">
          <View className="flex-row items-center mb-1 gap-1">
            <Ionicons name="pulse" size={12} color="#10B981" />
            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Volumen
            </Text>
          </View>
          <View className="flex-row items-baseline gap-1">
            <Text
              className="text-lg font-bold"
              style={{ color: isDark ? '#F9FAFB' : '#111827' }}
            >
              {averages.average_volume.toFixed(0)}
            </Text>
            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              kg
            </Text>
          </View>
        </View>
      </View>
    </InfoCard>
  );
}
