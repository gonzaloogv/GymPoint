import React, { useCallback } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Screen } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { KPICard } from '../components/KPICard';
import { TimeSelector } from '../components/TimeSelector';
import { ProgressChart } from '../components/ProgressChart';

type ExerciseProgressScreenProps = {
  navigation: any;
};

export function ExerciseProgressScreen({ navigation }: ExerciseProgressScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleBackPress = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  const periods = [
    { value: '7d' as const, label: '7d' },
    { value: '30d' as const, label: '30d' },
    { value: '90d' as const, label: '90d' },
    { value: '12m' as const, label: '12m' },
  ];

  // Mock metrics data for exercise progress
  const exerciseMetrics = [
    {
      id: '1',
      type: 'prRecords' as const,
      value: 24,
      unit: 'PRs',
      change: 5,
      changeType: 'up' as const,
    },
    {
      id: '2',
      type: 'volume' as const,
      value: 4250,
      unit: 'kg',
      change: 320,
      changeType: 'up' as const,
    },
    {
      id: '3',
      type: 'sets' as const,
      value: 156,
      unit: 'sets',
      change: 24,
      changeType: 'up' as const,
    },
    {
      id: '4',
      type: 'avgStrength' as const,
      value: 87.2,
      unit: '%',
      change: 12,
      changeType: 'up' as const,
    },
  ];

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
            selected="90d"
            onSelect={() => {}}
          />

          {/* Metrics Grid - 2x2 Layout */}
          <View className="px-4 pb-6">
            {/* Row 1 */}
            <View className="flex-row gap-3 mb-3">
              <View className="w-[48%]">
                <KPICard
                  icon={<Ionicons name="medal" size={20} color="#FCD34D" />}
                  label="PRs"
                  value={`${exerciseMetrics[0].value}`}
                  change={exerciseMetrics[0].change}
                  changeType={exerciseMetrics[0].changeType}
                />
              </View>
              <View className="w-[48%]">
                <KPICard
                  icon={<Ionicons name="barbell" size={20} color="#EF4444" />}
                  label="Volumen Total"
                  value={`${exerciseMetrics[1].value} kg`}
                  change={exerciseMetrics[1].change}
                  changeType={exerciseMetrics[1].changeType}
                />
              </View>
            </View>

            {/* Row 2 */}
            <View className="flex-row gap-3">
              <View className="w-[48%]">
                <KPICard
                  icon={<Ionicons name="layers" size={20} color="#8B5CF6" />}
                  label="Series"
                  value={`${exerciseMetrics[2].value}`}
                  change={exerciseMetrics[2].change}
                  changeType={exerciseMetrics[2].changeType}
                />
              </View>
              <View className="w-[48%]">
                <KPICard
                  icon={<Ionicons name="trending-up" size={20} color="#10B981" />}
                  label="Fuerza Promedio"
                  value={`${exerciseMetrics[3].value}%`}
                  change={exerciseMetrics[3].change}
                  changeType={exerciseMetrics[3].changeType}
                />
              </View>
            </View>
          </View>

          {/* Chart */}
          <ProgressChart
            title="Volumen vs tiempo"
            subtitle="Progresión de levantamiento"
            count={156}
            unit="sets en 90d"
          />

          {/* Exercises Summary */}
          <View className={`mx-4 p-4 rounded-xl mb-6 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
          }`}>
            <Text className={`font-bold text-lg mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Top Ejercicios
            </Text>
            <View className="space-y-3">
              <View className="flex-row items-center justify-between mb-2">
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
              <View className="flex-row items-center justify-between mb-2">
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
