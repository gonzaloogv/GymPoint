import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ScrollView, View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '@shared/hooks';
import { Screen } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useProgress } from '@features/progress/presentation/hooks/useProgress';
import { useHomeStore } from '@features/home/presentation/state/home.store';
import { BodyMetricsRemote, type BodyMetricResponseDTO } from '@features/progress/data/bodyMetrics.remote';
import { KPICard } from '../components/KPICard';
import { TimeSelector } from '../components/TimeSelector';
import { ProgressChart } from '../components/ProgressChart';
import { MeasurementModal, type MeasurementData } from '../components/MeasurementModal';
import { AnimatedStatsChart } from '../components/AnimatedStatsChart';

type PhysicalProgressScreenProps = {
  navigation: any;
};

export function PhysicalProgressScreen({ navigation }: PhysicalProgressScreenProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { selectedPeriod, setSelectedPeriod } = useProgress();
  const { user, fetchHomeData } = useHomeStore();
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [latestMetric, setLatestMetric] = useState<BodyMetricResponseDTO | null>(null);
  const [allMetrics, setAllMetrics] = useState<BodyMetricResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [editingMetric, setEditingMetric] = useState<MeasurementData | null>(null);

  // Función para cargar la última métrica
  const loadLatestMetric = useCallback(async () => {
    try {
      setIsLoading(true);
      const metric = await BodyMetricsRemote.getLatest();
      setLatestMetric(metric);
    } catch (error) {
      // Error cargando métrica
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función para cargar todas las métricas
  const loadAllMetrics = useCallback(async () => {
    try {
      const response = await BodyMetricsRemote.list({ limit: 100 });
      setAllMetrics(response.data);
    } catch (error) {
      // Error cargando métricas
    }
  }, []);

  // Obtener datos reales al montar el componente
  useEffect(() => {
    fetchHomeData();
    loadLatestMetric();
    loadAllMetrics();
  }, []);

  // Filtrar métricas por período seleccionado
  const filteredMetrics = useMemo(() => {
    const days = { '7d': 7, '30d': 30, '90d': 90, '12m': 365 }[selectedPeriod];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return allMetrics.filter(m => new Date(m.date) >= cutoffDate);
  }, [allMetrics, selectedPeriod]);

  const currentStreak = user?.streak || 0;

  const handleBackPress = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  const handleEditMetric = useCallback(() => {
    if (!latestMetric) return;

    // Convertir BodyMetricResponseDTO a MeasurementData
    const measurementData: MeasurementData = {
      date: latestMetric.date,
      weight_kg: latestMetric.weight_kg?.toString() || '',
      height_cm: latestMetric.height_cm?.toString() || '',
      body_fat_percentage: latestMetric.body_fat_percentage?.toString() || '',
      muscle_mass_kg: latestMetric.muscle_mass_kg?.toString() || '',
      waist_cm: latestMetric.waist_cm?.toString() || '',
      chest_cm: latestMetric.chest_cm?.toString() || '',
      arms_cm: latestMetric.arms_cm?.toString() || '',
      notes: latestMetric.notes || '',
    };

    setEditingMetric(measurementData);
    setEditMode('edit');
    setShowMeasurementModal(true);
  }, [latestMetric]);

  const handleAddMetric = useCallback(() => {
    setEditMode('create');
    setEditingMetric(null);
    setShowMeasurementModal(true);
  }, []);

  const handleSaveMeasurement = useCallback(async (data: MeasurementData) => {
    try {
      const payload = {
        date: data.date,
        weight_kg: data.weight_kg ? parseFloat(data.weight_kg) : undefined,
        height_cm: data.height_cm ? parseFloat(data.height_cm) : undefined,
        body_fat_percentage: data.body_fat_percentage ? parseFloat(data.body_fat_percentage) : undefined,
        muscle_mass_kg: data.muscle_mass_kg ? parseFloat(data.muscle_mass_kg) : undefined,
        waist_cm: data.waist_cm ? parseFloat(data.waist_cm) : undefined,
        chest_cm: data.chest_cm ? parseFloat(data.chest_cm) : undefined,
        arms_cm: data.arms_cm ? parseFloat(data.arms_cm) : undefined,
        notes: data.notes,
      };

      if (editMode === 'edit' && latestMetric) {
        // Actualizar métrica existente
        const updatePayload = { ...payload };
        delete updatePayload.date; // No se puede cambiar la fecha en edición
        await BodyMetricsRemote.update(latestMetric.id_metric, updatePayload);
      } else {
        // Crear nueva métrica
        await BodyMetricsRemote.create(payload);
      }

      Alert.alert(
        'Éxito',
        editMode === 'edit'
          ? 'Métrica corporal actualizada correctamente'
          : 'Métrica corporal registrada correctamente',
        [{ text: 'OK' }]
      );

      setShowMeasurementModal(false);
      setEditMode('create');
      setEditingMetric(null);

      // Refrescar datos
      loadLatestMetric();
      loadAllMetrics();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error?.message || error.message || 'No se pudo guardar la medición',
        [{ text: 'OK' }]
      );
    }
  }, [editMode, latestMetric, loadLatestMetric]);

  const periods = [
    { value: '7d' as const, label: '7d' },
    { value: '30d' as const, label: '30d' },
    { value: '90d' as const, label: '90d' },
    { value: '12m' as const, label: '12m' },
  ];

  // Extraer valores de la última métrica o usar valores por defecto
  const weight = latestMetric?.weight_kg ? parseFloat(latestMetric.weight_kg.toString()) : null;
  const bodyFat = latestMetric?.body_fat_percentage ? parseFloat(latestMetric.body_fat_percentage.toString()) : null;
  const bmi = latestMetric?.bmi ? parseFloat(latestMetric.bmi.toString()) : null;
  const height = latestMetric?.height_cm ? parseFloat(latestMetric.height_cm.toString()) : null;

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

          {isLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color={isDark ? '#60A5FA' : '#3B82F6'} />
              <Text className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Cargando métricas...
              </Text>
            </View>
          ) : (
            <>
              {/* Si no hay métricas, mostrar mensaje */}
              {!latestMetric && (
                <View className="px-4 pb-6">
                  <View
                    className={`p-6 rounded-xl border ${
                      isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <View className="items-center">
                      <Ionicons
                        name="fitness"
                        size={48}
                        color={isDark ? '#60A5FA' : '#3B82F6'}
                      />
                      <Text className={`mt-4 text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Sin métricas registradas
                      </Text>
                      <Text className={`mt-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Comienza a registrar tus métricas corporales para ver tu progreso
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Gráficos de Estadísticas Animadas */}
              <AnimatedStatsChart
                metrics={filteredMetrics}
                period={selectedPeriod}
                latestMetric={latestMetric}
              />

              {/* Latest Metric Info with Edit Button */}
              {latestMetric && (
                <View className="px-4 pb-6">
                  {/* Header con botón de editar */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View>
                      <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Última medición completa
                      </Text>
                      <Text className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(latestMetric.date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    </View>
                    <Pressable
                      onPress={handleEditMetric}
                      className={`flex-row items-center px-3 py-2 rounded-lg ${
                        isDark ? 'bg-blue-900/30' : 'bg-blue-50'
                      }`}
                    >
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color={isDark ? '#60A5FA' : '#3B82F6'}
                      />
                      <Text className={`ml-1 text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        Editar
                      </Text>
                    </Pressable>
                  </View>

                  {/* Grid de todas las métricas */}
                  <View
                    className={`rounded-xl p-4 ${
                      isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {/* Fila 1: Peso y Altura */}
                    <View className="flex-row gap-3 mb-3">
                      {weight && (
                        <View className="flex-1">
                          <View className="flex-row items-center mb-1">
                            <Ionicons name="scale-outline" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                            <Text className={`ml-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Peso
                            </Text>
                          </View>
                          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {weight.toFixed(1)} kg
                          </Text>
                        </View>
                      )}
                      {height && (
                        <View className="flex-1">
                          <View className="flex-row items-center mb-1">
                            <Ionicons name="resize-outline" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                            <Text className={`ml-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Altura
                            </Text>
                          </View>
                          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {height.toFixed(0)} cm
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Fila 2: IMC y Grasa Corporal */}
                    <View className="flex-row gap-3 mb-3">
                      {bmi && (
                        <View className="flex-1">
                          <View className="flex-row items-center mb-1">
                            <Ionicons name="bar-chart-outline" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                            <Text className={`ml-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              IMC
                            </Text>
                          </View>
                          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {bmi.toFixed(1)}
                          </Text>
                        </View>
                      )}
                      {bodyFat && (
                        <View className="flex-1">
                          <View className="flex-row items-center mb-1">
                            <Ionicons name="water-outline" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                            <Text className={`ml-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Grasa Corporal
                            </Text>
                          </View>
                          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {bodyFat.toFixed(1)}%
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Fila 3: Masa Muscular (si existe) */}
                    {latestMetric.muscle_mass_kg && (
                      <View className="flex-row gap-3 mb-3">
                        <View className="flex-1">
                          <View className="flex-row items-center mb-1">
                            <Ionicons name="fitness-outline" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
                            <Text className={`ml-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Masa Muscular
                            </Text>
                          </View>
                          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {parseFloat(latestMetric.muscle_mass_kg.toString()).toFixed(1)} kg
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Fila 4: Medidas corporales (si existen) */}
                    {(latestMetric.waist_cm || latestMetric.chest_cm || latestMetric.arms_cm) && (
                      <>
                        <View className={`border-t my-2 ${isDark ? 'border-gray-700' : 'border-gray-300'}`} />
                        <Text className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Medidas corporales
                        </Text>
                        <View className="flex-row gap-3">
                          {latestMetric.waist_cm && (
                            <View className="flex-1">
                              <Text className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                Cintura
                              </Text>
                              <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {parseFloat(latestMetric.waist_cm.toString()).toFixed(0)} cm
                              </Text>
                            </View>
                          )}
                          {latestMetric.chest_cm && (
                            <View className="flex-1">
                              <Text className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                Pecho
                              </Text>
                              <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {parseFloat(latestMetric.chest_cm.toString()).toFixed(0)} cm
                              </Text>
                            </View>
                          )}
                          {latestMetric.arms_cm && (
                            <View className="flex-1">
                              <Text className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                Brazos
                              </Text>
                              <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {parseFloat(latestMetric.arms_cm.toString()).toFixed(0)} cm
                              </Text>
                            </View>
                          )}
                        </View>
                      </>
                    )}

                    {/* Notas (si existen) */}
                    {latestMetric.notes && (
                      <>
                        <View className={`border-t my-2 ${isDark ? 'border-gray-700' : 'border-gray-300'}`} />
                        <Text className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Notas
                        </Text>
                        <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {latestMetric.notes}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              )}
            </>
          )}

          {/* Add Measurement Button */}
          <Pressable
            onPress={handleAddMetric}
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
          onClose={() => {
            setShowMeasurementModal(false);
            setEditMode('create');
            setEditingMetric(null);
          }}
          onSave={handleSaveMeasurement}
          initialData={editingMetric}
          mode={editMode}
        />
      </View>
    </Screen>
  );
}
