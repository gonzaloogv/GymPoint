import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '@shared/hooks';
import {
  SurfaceScreen,
  MetricCard,
  IconButton,
  Badge,
  InfoSection,
  InfoCard,
  SelectorModal,
  type SelectorItem,
  ScreenHeader
} from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useProgress } from '@features/progress/presentation/hooks/useProgress';
import { useHomeStore } from '@features/home/presentation/state/home.store';
import { BodyMetricsRemote, type BodyMetricResponseDTO } from '@features/progress/data/bodyMetrics.remote';
import { TimeSelector } from '../components/TimeSelector';
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
  const [selectedMetricIndex, setSelectedMetricIndex] = useState(0);
  const [showMetricSelector, setShowMetricSelector] = useState(false);

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

  // Obtener la métrica seleccionada del historial
  const selectedMetric = allMetrics[selectedMetricIndex] || latestMetric;

  // Extraer valores de la métrica seleccionada o usar valores por defecto
  const weight = selectedMetric?.weight_kg ? parseFloat(selectedMetric.weight_kg.toString()) : null;
  const bodyFat = selectedMetric?.body_fat_percentage ? parseFloat(selectedMetric.body_fat_percentage.toString()) : null;
  const bmi = selectedMetric?.bmi ? parseFloat(selectedMetric.bmi.toString()) : null;
  const height = selectedMetric?.height_cm ? parseFloat(selectedMetric.height_cm.toString()) : null;

  // Transformar métricas en items del selector
  const metricSelectorItems: SelectorItem<BodyMetricResponseDTO>[] = useMemo(() => {
    return allMetrics.map((metric, index) => {
      const metricDate = new Date(metric.date + 'T12:00:00');
      const metadata: string[] = [];

      if (metric.weight_kg) metadata.push(`${parseFloat(metric.weight_kg.toString()).toFixed(1)} kg`);
      if (metric.body_fat_percentage) metadata.push(`${parseFloat(metric.body_fat_percentage.toString()).toFixed(1)}% grasa`);
      if (metric.bmi) metadata.push(`IMC ${parseFloat(metric.bmi.toString()).toFixed(1)}`);

      return {
        id: metric.id_metric,
        label: index === 0
          ? 'Última medición'
          : `Medición ${metricDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}`,
        description: metricDate.toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        metadata,
        badge: index === 0 ? 'Reciente' : undefined,
        value: metric
      };
    });
  }, [allMetrics]);

  return (
    <SurfaceScreen
      scroll
      contentContainerStyle={{
        paddingBottom: 48,
      }}
    >
      <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <ScreenHeader title="Mediciones" onBack={handleBackPress} />
        <View className="px-4 pt-4 pb-6 gap-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text
                className="text-[28px] font-extrabold"
                style={{ color: isDark ? '#F9FAFB' : '#111827', letterSpacing: -0.2 }}
              >
                Progreso físico
              </Text>
              <Text
                className="mt-2 text-xs font-semibold uppercase"
                style={{ color: isDark ? '#9CA3AF' : '#6B7280', letterSpacing: 1.2 }}
              >
                Peso, medidas y composición corporal
              </Text>
            </View>
            <Ionicons name="information-circle" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </View>

          <View
            className="h-px rounded-full"
            style={{ backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(148, 163, 184, 0.32)' }}
          />
        </View>

        <View className="flex-1">
          {/* Time Selector */}
          <View className="px-4 pb-6">
            <TimeSelector
              periods={periods}
              selected={selectedPeriod}
              onSelect={setSelectedPeriod}
            />
          </View>

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
                  <InfoCard>
                    <View className="items-center gap-3">
                      <Ionicons
                        name="fitness"
                        size={48}
                        color={isDark ? '#60A5FA' : '#3B82F6'}
                      />
                      <Text
                        className="text-lg font-semibold"
                        style={{ color: isDark ? '#F9FAFB' : '#111827' }}
                      >
                        Sin métricas registradas
                      </Text>
                      <Text className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Comienza a registrar tus métricas corporales para ver tu progreso
                      </Text>
                    </View>
                  </InfoCard>
                </View>
              )}

              {/* Gráficos de Estadísticas Animadas */}
              <AnimatedStatsChart
                metrics={filteredMetrics}
                period={selectedPeriod}
                latestMetric={latestMetric}
              />

              {/* Latest Metric Info with Edit Button */}
              {latestMetric && allMetrics.length > 0 && (
                <View className="px-4 pb-6">
                  {/* Header con selector desplegable y botón de editar */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1">
                      {allMetrics.length > 1 ? (
                        <Pressable
                          onPress={() => setShowMetricSelector(true)}
                          className={`flex-row items-center gap-2 p-2 rounded-lg ${
                            isDark ? 'bg-gray-800' : 'bg-gray-100'
                          }`}
                        >
                          <View className="flex-1">
                            <Text
                              className="text-lg font-bold"
                              style={{ color: isDark ? '#F9FAFB' : '#111827' }}
                            >
                              {selectedMetricIndex === 0
                                ? 'Última medición'
                                : (() => {
                                    const date = new Date(selectedMetric.date + 'T12:00:00');
                                    return `Medición ${date.toLocaleDateString('es-AR', {
                                      day: 'numeric',
                                      month: 'short'
                                    })}`;
                                  })()
                              }
                            </Text>
                            <Text className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {(() => {
                                const date = new Date(selectedMetric.date + 'T12:00:00');
                                return date.toLocaleDateString('es-AR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                });
                              })()}
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-down"
                            size={20}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                          />
                        </Pressable>
                      ) : (
                        <View>
                          <Text
                            className="text-lg font-bold"
                            style={{ color: isDark ? '#F9FAFB' : '#111827' }}
                          >
                            Última medición
                          </Text>
                          <Text className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {(() => {
                              const date = new Date(selectedMetric.date + 'T12:00:00');
                              return date.toLocaleDateString('es-AR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              });
                            })()}
                          </Text>
                        </View>
                      )}
                    </View>
                    {selectedMetricIndex === 0 && (
                      <IconButton
                        icon="create-outline"
                        label="Editar"
                        onPress={handleEditMetric}
                        variant="primary"
                        className="ml-2"
                      />
                    )}
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
                        <MetricCard
                          label="Peso"
                          value={weight.toFixed(1)}
                          unit="kg"
                          icon="scale-outline"
                        />
                      )}
                      {height && (
                        <MetricCard
                          label="Altura"
                          value={height.toFixed(0)}
                          unit="cm"
                          icon="resize-outline"
                        />
                      )}
                    </View>

                    {/* Fila 2: IMC y Grasa Corporal */}
                    <View className="flex-row gap-3 mb-3">
                      {bmi && (
                        <MetricCard
                          label="IMC"
                          value={bmi.toFixed(1)}
                          icon="bar-chart-outline"
                        />
                      )}
                      {bodyFat && (
                        <MetricCard
                          label="Grasa Corporal"
                          value={`${bodyFat.toFixed(1)}%`}
                          icon="water-outline"
                        />
                      )}
                    </View>

                    {/* Fila 3: Masa Muscular (si existe) */}
                    {selectedMetric.muscle_mass_kg && (
                      <View className="flex-row gap-3 mb-3">
                        <MetricCard
                          label="Masa Muscular"
                          value={parseFloat(selectedMetric.muscle_mass_kg.toString()).toFixed(1)}
                          unit="kg"
                          icon="fitness-outline"
                        />
                      </View>
                    )}

                    {/* Fila 4: Medidas corporales (si existen) */}
                    {(selectedMetric.waist_cm || selectedMetric.chest_cm || selectedMetric.arms_cm) && (
                      <>
                        <View className={`border-t my-2 ${isDark ? 'border-gray-700' : 'border-gray-300'}`} />
                        <Text className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Medidas corporales
                        </Text>
                        <View className="flex-row gap-3">
                          {selectedMetric.waist_cm && (
                            <MetricCard
                              label="Cintura"
                              value={parseFloat(selectedMetric.waist_cm.toString()).toFixed(0)}
                              unit="cm"
                            />
                          )}
                          {selectedMetric.chest_cm && (
                            <MetricCard
                              label="Pecho"
                              value={parseFloat(selectedMetric.chest_cm.toString()).toFixed(0)}
                              unit="cm"
                            />
                          )}
                          {selectedMetric.arms_cm && (
                            <MetricCard
                              label="Brazos"
                              value={parseFloat(selectedMetric.arms_cm.toString()).toFixed(0)}
                              unit="cm"
                            />
                          )}
                        </View>
                      </>
                    )}

                    {/* Notas (si existen) */}
                    {selectedMetric.notes && (
                      <>
                        <View className={`border-t my-2 ${isDark ? 'border-gray-700' : 'border-gray-300'}`} />
                        <InfoSection
                          title="Notas"
                          content={selectedMetric.notes}
                          icon="document-text-outline"
                        />
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
        </View>

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

        {/* Metric Selector Modal */}
        <SelectorModal
          visible={showMetricSelector}
          title="Seleccionar medición"
          subtitle={`${allMetrics.length} ${allMetrics.length === 1 ? 'medición registrada' : 'mediciones registradas'}`}
          items={metricSelectorItems}
          selectedId={selectedMetric?.id_metric}
          onSelect={(item) => {
            const index = allMetrics.findIndex(m => m.id_metric === item.id);
            if (index !== -1) {
              setSelectedMetricIndex(index);
            }
          }}
          onClose={() => setShowMetricSelector(false)}
          renderCustomContent={(item) => {
            if (item.value.notes) {
              return (
                <View className="flex-row items-center gap-1 mt-1">
                  <Ionicons
                    name="document-text-outline"
                    size={12}
                    color={isDark ? '#9CA3AF' : '#6B7280'}
                  />
                  <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`} numberOfLines={1}>
                    {item.value.notes}
                  </Text>
                </View>
              );
            }
            return null;
          }}
        />
      </View>
    </SurfaceScreen>
  );
}
