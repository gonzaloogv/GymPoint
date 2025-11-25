import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
import { InfoCard } from '@shared/components/ui';
import type { PersonalRecord } from '../../hooks/useExerciseProgress';

interface ExercisePRCardProps {
  exerciseName: string;
  personalRecord: PersonalRecord | null;
  loading?: boolean;
}

export function ExercisePRCard({ exerciseName, personalRecord, loading = false }: ExercisePRCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (loading) {
    return (
      <InfoCard variant="compact">
        <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Cargando récord personal...
        </Text>
      </InfoCard>
    );
  }

  if (!personalRecord) {
    return (
      <InfoCard variant="compact">
        <View className="flex-row items-center gap-2">
          <Ionicons
            name="information-circle"
            size={20}
            color={isDark ? '#60A5FA' : '#3B82F6'}
          />
          <Text className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
            Aún no tienes registros de {exerciseName}
          </Text>
        </View>
      </InfoCard>
    );
  }

  return (
    <InfoCard
      variant="compact"
      style={{
        backgroundColor: isDark ? 'rgba(217, 119, 6, 0.1)' : 'rgba(254, 243, 199, 0.5)',
        borderColor: isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.5)',
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className="bg-yellow-500/20 p-2 rounded-full">
            <Ionicons name="trophy" size={20} color="#EAB308" />
          </View>
          <Text
            className="text-base font-bold"
            style={{ color: isDark ? '#F9FAFB' : '#111827' }}
          >
            Récord Personal
          </Text>
        </View>
        <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {new Date(personalRecord.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
        </Text>
      </View>

      {/* Stats Grid */}
      <View className="flex-row gap-3">
        {/* Peso máximo */}
        <View className="flex-1">
          <Text className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Peso máximo
          </Text>
          <View className="flex-row items-baseline gap-1">
            <Text className={`text-2xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
              {personalRecord.used_weight}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              kg
            </Text>
          </View>
        </View>

        {/* Repeticiones */}
        <View className="flex-1">
          <Text className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Repeticiones
          </Text>
          <Text
            className="text-2xl font-bold"
            style={{ color: isDark ? '#F9FAFB' : '#111827' }}
          >
            {personalRecord.reps}
          </Text>
        </View>

        {/* Volumen total */}
        <View className="flex-1">
          <Text className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Volumen
          </Text>
          <View className="flex-row items-baseline gap-1">
            <Text
              className="text-lg font-bold"
              style={{ color: isDark ? '#F9FAFB' : '#111827' }}
            >
              {personalRecord.total_volume}
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
