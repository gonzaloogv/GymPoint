import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Screen } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { TimeSelector } from '../components/TimeSelector';

type ExerciseProgressScreenProps = {
  navigation: any;
};

export function ExerciseProgressScreen({ navigation }: ExerciseProgressScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '12m'>('90d');

  const handleBackPress = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  const periods = [
    { value: '7d' as const, label: '7d' },
    { value: '30d' as const, label: '30d' },
    { value: '90d' as const, label: '90d' },
    { value: '12m' as const, label: '12m' },
  ];

  // Mock data simulando métricas de ejercicio al igual que body metrics
  const latestExerciseMetric = {
    prRecords: 24,
    volume: 4250,
    sets: 156,
    avgStrength: 87.2,
    date: new Date().toISOString(),
  };

  return (
    <Screen scroll safeAreaTop safeAreaBottom>
      <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-4">
          <Pressable onPress={handleBackPress} className="flex-row items-center">
            <Ionicons
              name="chevron-back"
              size={28}
              color={isDark ? '#60A5FA' : '#3B82F6'}
            />
            <Text className={`ml-1 text-base font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              Volver al progreso
            </Text>
          </Pressable>
          <Ionicons
            name="information-circle"
            size={24}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </View>

        <Text className={`px-4 text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Progreso por Ejercicio
        </Text>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Time Selector */}
          <TimeSelector
            periods={periods}
            selected={selectedPeriod}
            onSelect={setSelectedPeriod}
          />

          {/* Estadísticas - Mensaje informativo */}
          <View className="px-4 pb-6">
            <View
              className={`p-6 rounded-xl border ${
                isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <View className="items-center">
                <Ionicons
                  name="bar-chart"
                  size={48}
                  color={isDark ? '#60A5FA' : '#3B82F6'}
                />
                <Text className={`mt-4 text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Gráficos de progreso próximamente
                </Text>
                <Text className={`mt-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Los gráficos interactivos de ejercicios estarán disponibles una vez que se integre la funcionalidad
                </Text>
              </View>
            </View>
          </View>

          {/* Latest Metrics Summary */}
          <View className="px-4 pb-6">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Resumen actual
                </Text>
                <Text className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {new Date(latestExerciseMetric.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </View>

            {/* Grid de métricas */}
            <View
              className={`rounded-xl p-4 ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
              }`}
            >
              {/* Fila 1: PRs y Volumen */}
              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="medal" size={14} color="#FCD34D" />
                    <Text className={`ml-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      PRs
                    </Text>
                  </View>
                  <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {latestExerciseMetric.prRecords}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="barbell" size={14} color="#EF4444" />
                    <Text className={`ml-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Volumen
                    </Text>
                  </View>
                  <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {latestExerciseMetric.volume} kg
                  </Text>
                </View>
              </View>

              {/* Fila 2: Series y Fuerza */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="layers" size={14} color="#8B5CF6" />
                    <Text className={`ml-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Series
                    </Text>
                  </View>
                  <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {latestExerciseMetric.sets}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="trending-up" size={14} color="#10B981" />
                    <Text className={`ml-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Fuerza Promedio
                    </Text>
                  </View>
                  <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {latestExerciseMetric.avgStrength.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Top Exercises */}
          <View className="px-4 pb-6">
            <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Top Ejercicios
            </Text>
            <View
              className={`rounded-xl p-4 ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <Ionicons name="barbell" size={16} color="#EF4444" style={{ marginRight: 8 }} />
                  <Text className={`flex-1 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Bench Press
                  </Text>
                </View>
                <Text className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  120 kg
                </Text>
              </View>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <Ionicons name="barbell" size={16} color="#EF4444" style={{ marginRight: 8 }} />
                  <Text className={`flex-1 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Sentadilla
                  </Text>
                </View>
                <Text className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  180 kg
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Ionicons name="barbell" size={16} color="#EF4444" style={{ marginRight: 8 }} />
                  <Text className={`flex-1 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Peso Muerto
                  </Text>
                </View>
                <Text className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  220 kg
                </Text>
              </View>
            </View>
          </View>

          <View className="h-4" />
        </ScrollView>
      </View>
    </Screen>
  );
}
