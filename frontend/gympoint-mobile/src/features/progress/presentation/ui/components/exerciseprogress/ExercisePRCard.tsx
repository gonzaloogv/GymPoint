import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/hooks';
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
      <View
        className={`p-4 rounded-xl border ${
          isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Cargando récord personal...
        </Text>
      </View>
    );
  }

  if (!personalRecord) {
    return (
      <View
        className={`p-4 rounded-xl border ${
          isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-blue-50 border-blue-200'
        }`}
      >
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
      </View>
    );
  }

  return (
    <View
      className={`p-4 rounded-xl border ${
        isDark ? 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-700/30' : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
      }`}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className="bg-yellow-500/20 p-2 rounded-full">
            <Ionicons name="trophy" size={20} color="#EAB308" />
          </View>
          <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {personalRecord.reps}
          </Text>
        </View>

        {/* Volumen total */}
        <View className="flex-1">
          <Text className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Volumen
          </Text>
          <View className="flex-row items-baseline gap-1">
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {personalRecord.total_volume}
            </Text>
            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              kg
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
