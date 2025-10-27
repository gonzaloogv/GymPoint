import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Screen } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useProgress } from '@features/progress/presentation/hooks/useProgress';
import { KPICard } from '../components/KPICard';
import { TimeSelector } from '../components/TimeSelector';
import { ProgressChart } from '../components/ProgressChart';
import { MeasurementModal, type MeasurementData } from '../components/MeasurementModal';

type PhysicalProgressScreenProps = {
  navigation: any;
};

export function PhysicalProgressScreen({ navigation }: PhysicalProgressScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { selectedPeriod, setSelectedPeriod } = useProgress();
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);

  const handleBackPress = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  const handleSaveMeasurement = useCallback((data: MeasurementData) => {
    // TODO: Save measurement to store/backend
    console.log('Saving measurement:', data);
    setShowMeasurementModal(false);
  }, []);

  const periods = [
    { value: '7d' as const, label: '7d' },
    { value: '30d' as const, label: '30d' },
    { value: '90d' as const, label: '90d' },
    { value: '12m' as const, label: '12m' },
  ];

  // Mock metrics data
  const mockMetrics = [
    {
      id: '1',
      type: 'weight' as const,
      value: 72.5,
      unit: 'kg',
      change: 0.8,
      changeType: 'up' as const,
      date: '2025-10-25',
    },
    {
      id: '2',
      type: 'bodyFat' as const,
      value: 18.2,
      unit: '%',
      change: -1.2,
      changeType: 'down' as const,
      date: '2025-10-25',
    },
    {
      id: '3',
      type: 'imc' as const,
      value: 22.1,
      unit: '',
      change: 0.3,
      changeType: 'up' as const,
      date: '2025-10-25',
    },
    {
      id: '4',
      type: 'streak' as const,
      value: 14,
      unit: 'días',
      change: 7,
      changeType: 'up' as const,
      date: '2025-10-25',
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
          Progreso Físico
        </Text>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Time Selector */}
          <TimeSelector
            periods={periods}
            selected={selectedPeriod}
            onSelect={setSelectedPeriod}
          />

          {/* Metrics Grid - 2x2 Layout */}
          <View className="px-4 pb-6">
            {/* Row 1 */}
            <View className="flex-row gap-3 mb-3">
              <View className="w-[48%]">
                <KPICard
                  icon={<Ionicons name="scale" size={20} color="#9CA3AF" />}
                  label="Peso"
                  value={`${mockMetrics[0].value} ${mockMetrics[0].unit}`}
                  change={mockMetrics[0].change}
                  changeType={mockMetrics[0].changeType}
                />
              </View>
              <View className="w-[48%]">
                <KPICard
                  icon={<Ionicons name="water" size={20} color="#60A5FA" />}
                  label="% Grasa"
                  value={`${mockMetrics[1].value} ${mockMetrics[1].unit}`}
                  change={mockMetrics[1].change}
                  changeType={mockMetrics[1].changeType}
                />
              </View>
            </View>

            {/* Row 2 */}
            <View className="flex-row gap-3">
              <View className="w-[48%]">
                <KPICard
                  icon={<Ionicons name="bar-chart" size={20} color="#6B7280" />}
                  label="IMC"
                  value={`${mockMetrics[2].value}`}
                  change={mockMetrics[2].change}
                  changeType={mockMetrics[2].changeType}
                />
              </View>
              <View className="w-[48%]">
                <KPICard
                  icon={<Ionicons name="flame" size={20} color="#FF6B35" />}
                  label="Racha"
                  value={`${mockMetrics[3].value} ${mockMetrics[3].unit}`}
                  change={mockMetrics[3].change}
                  changeType={mockMetrics[3].changeType}
                />
              </View>
            </View>
          </View>

          {/* Chart */}
          <ProgressChart
            title="Peso vs tiempo"
            subtitle="Gráfico de progreso"
            count={91}
            unit="mediciones en 90d"
          />

          {/* Min/Avg/Max */}
          <View className="flex-row px-4 pb-6 gap-2">
            <View
              className={`flex-1 p-4 rounded-xl ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
              }`}
            >
              <Text className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Mínimo
              </Text>
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                72.5 kg
              </Text>
            </View>
            <View
              className={`flex-1 p-4 rounded-xl ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
              }`}
            >
              <Text className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Promedio
              </Text>
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                72.9 kg
              </Text>
            </View>
            <View
              className={`flex-1 p-4 rounded-xl ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
              }`}
            >
              <Text className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Máximo
              </Text>
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                73.3 kg
              </Text>
            </View>
          </View>

          {/* Add Measurement Button */}
          <Pressable
            onPress={() => setShowMeasurementModal(true)}
            className="mx-4 py-4 px-6 rounded-xl bg-blue-500 items-center justify-center mb-8 flex-row"
          >
            <Ionicons name="add" size={20} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white font-semibold text-base">Añadir medición</Text>
          </Pressable>

          <View className="h-4" />
        </ScrollView>

        {/* Measurement Modal */}
        <MeasurementModal
          visible={showMeasurementModal}
          onClose={() => setShowMeasurementModal(false)}
          onSave={handleSaveMeasurement}
        />
      </View>
    </Screen>
  );
}
