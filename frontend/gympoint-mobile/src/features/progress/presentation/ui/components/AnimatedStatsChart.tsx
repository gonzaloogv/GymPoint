import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@shared/hooks';
import type { BodyMetricResponseDTO } from '@features/progress/data/bodyMetrics.remote';
import { MetricSelector, type MetricType } from './MetricSelector';
import { StatsCard } from './StatsCard';
import { BMIIndicator } from './BMIIndicator';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 32; // padding horizontal

interface AnimatedStatsChartProps {
  metrics: BodyMetricResponseDTO[];
  period: '7d' | '30d' | '90d' | '12m';
  latestMetric: BodyMetricResponseDTO | null;
}

export function AnimatedStatsChart({ metrics, period, latestMetric }: AnimatedStatsChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedMetric, setSelectedMetric] = useState<MetricType>('weight');
  const [tooltipData, setTooltipData] = useState<{
    value: number;
    label: string;
    date: string;
    index: number;
  } | null>(null);

  // Valores compartidos para animaciones del tooltip
  const tooltipScale = useSharedValue(0);
  const tooltipOpacity = useSharedValue(0);

  // Valores compartidos para animaciones de transición de métricas
  const chartOpacity = useSharedValue(1);
  const chartTranslateY = useSharedValue(0);

  // Resetear tooltip cuando cambie la métrica o el período
  useEffect(() => {
    setTooltipData(null);
    tooltipScale.value = 0;
    tooltipOpacity.value = 0;
  }, [selectedMetric, period]);

  // Animar transición al cambiar de métrica
  useEffect(() => {
    // Fade out y deslizar hacia abajo
    chartOpacity.value = withTiming(0, { duration: 150 });
    chartTranslateY.value = withTiming(10, { duration: 150 });

    // Después de la salida, hacer fade in y volver a posición original
    setTimeout(() => {
      chartOpacity.value = withTiming(1, { duration: 200 });
      chartTranslateY.value = withTiming(0, { duration: 200 });
    }, 150);
  }, [selectedMetric]);

  // Animar tooltip cuando aparece/desaparece
  useEffect(() => {
    if (tooltipData) {
      tooltipScale.value = withSpring(1, {
        damping: 25,
        stiffness: 250,
        mass: 0.5,
      });
      tooltipOpacity.value = withTiming(1, { duration: 150 });
    } else {
      tooltipScale.value = withTiming(0, { duration: 100 });
      tooltipOpacity.value = withTiming(0, { duration: 100 });
    }
  }, [tooltipData]);

  // Estilo animado para el tooltip
  const animatedTooltipStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: tooltipScale.value }],
      opacity: tooltipOpacity.value,
    };
  });

  // Estilo animado para el contenedor del chart
  const animatedChartStyle = useAnimatedStyle(() => {
    return {
      opacity: chartOpacity.value,
      transform: [{ translateY: chartTranslateY.value }],
    };
  });

  // Colores según métrica
  const getMetricColor = (metric: MetricType): string => {
    const colors = {
      weight: isDark ? '#60A5FA' : '#3B82F6',       // blue
      bodyFat: isDark ? '#F472B6' : '#EC4899',      // pink
      bmi: isDark ? '#A78BFA' : '#8B5CF6',          // purple
      muscleMass: isDark ? '#34D399' : '#10B981',   // green
      measurements: isDark ? '#FBBF24' : '#F59E0B', // amber
    };
    return colors[metric];
  };

  // Obtener datos para el gráfico según métrica seleccionada
  const getChartData = () => {
    if (metrics.length === 0) return null;

    const dataKey = {
      weight: 'weight_kg',
      bodyFat: 'body_fat_percentage',
      bmi: 'bmi',
      muscleMass: 'muscle_mass_kg',
      measurements: 'waist_cm',
    }[selectedMetric];

    const filteredData = metrics
      .filter(m => {
        const value = m[dataKey as keyof BodyMetricResponseDTO];
        return value !== null && value !== undefined && Number(value) > 0;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Orden: más viejo a más nuevo

    if (filteredData.length === 0) return null;

    // Formatear labels con el formato dd/mm (izquierda=viejo, derecha=nuevo)
    // El ordenamiento ya considera hora completa con getTime() en línea 54
    const labels = filteredData.map(m => {
      const date = new Date(m.date);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    });

    const data = filteredData.map(m =>
      Number(m[dataKey as keyof BodyMetricResponseDTO]) || 0
    );

    return { labels, data, rawData: filteredData };
  };

  const chartData = getChartData();
  const hasData = chartData !== null && chartData.data.length > 0;

  // Obtener valores actuales y anteriores para StatsCard desde latestMetric
  // Esto asegura que siempre mostramos los valores de la última medición registrada
  const getCurrentValueFromLatest = (): number | null => {
    if (!latestMetric) return null;

    const dataKey = {
      weight: 'weight_kg',
      bodyFat: 'body_fat_percentage',
      bmi: 'bmi',
      muscleMass: 'muscle_mass_kg',
      measurements: 'waist_cm',
    }[selectedMetric];

    const value = latestMetric[dataKey as keyof BodyMetricResponseDTO];
    return value !== null && value !== undefined ? Number(value) : null;
  };

  const currentValue = getCurrentValueFromLatest();

  // previousValue lo sacamos del gráfico (segundo dato, ya que están invertidos: primero=más nuevo, segundo=anterior)
  const previousValue = chartData && chartData.data.length > 1 ? chartData.data[1] : null;

  // Unidad según métrica
  const getUnit = (): string => {
    const units = {
      weight: 'kg',
      bodyFat: '%',
      bmi: '',
      muscleMass: 'kg',
      measurements: 'cm',
    };
    return units[selectedMetric];
  };

  // Label según métrica
  const getLabel = (): string => {
    const labels = {
      weight: 'Peso',
      bodyFat: 'Grasa Corporal',
      bmi: 'IMC',
      muscleMass: 'Masa Muscular',
      measurements: 'Cintura',
    };
    return labels[selectedMetric];
  };

  // Configuración del gráfico
  const chartConfig = {
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    backgroundGradientFrom: isDark ? '#1F2937' : '#FFFFFF',
    backgroundGradientTo: isDark ? '#111827' : '#F9FAFB',
    decimalPlaces: 1,
    color: (opacity = 1) => {
      const metricColor = getMetricColor(selectedMetric);
      // Convertir hex a rgba
      const r = parseInt(metricColor.slice(1, 3), 16);
      const g = parseInt(metricColor.slice(3, 5), 16);
      const b = parseInt(metricColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    labelColor: (opacity = 1) => isDark ? `rgba(156, 163, 175, ${opacity})` : `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: getMetricColor(selectedMetric),
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: isDark ? '#374151' : '#E5E7EB',
      strokeWidth: 1,
    },
  };

  // Renderizar gráfico según tipo de métrica
  const renderChart = () => {
    if (!hasData) {
      return (
        <View
          key={`empty-${selectedMetric}`}
          className={`p-8 rounded-xl items-center justify-center ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
          }`}
          style={{ height: 250 }}
        >
          <Text className={`text-center text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No hay suficientes datos para mostrar el gráfico
          </Text>
          <Text className={`text-center text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Agrega más métricas para ver tu progreso
          </Text>
        </View>
      );
    }

    // Para IMC, mostrar el indicador especial
    if (selectedMetric === 'bmi') {
      return <BMIIndicator key={`bmi-${currentValue}`} bmi={currentValue} />;
    }

    // Para medidas, mostrar gráfico de barras
    if (selectedMetric === 'measurements') {
      return renderMeasurementsChart();
    }

    // react-native-chart-kit requiere al menos 2 datos
    // Si solo hay 1 dato, duplicamos el punto
    const displayData = chartData.data.length === 1
      ? [chartData.data[0], chartData.data[0]]
      : chartData.data;

    // Limitar labels si hay muchos puntos, pero mantener sincronización con datos
    const displayLabels = chartData.labels.length === 1
      ? [chartData.labels[0], chartData.labels[0]]
      : chartData.labels;

    // Para otras métricas, mostrar gráfico de línea
    return (
      <View
        key={`chart-${selectedMetric}`}
        className={`rounded-xl overflow-hidden ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
      >
        <LineChart
          data={{
            labels: displayLabels,
            datasets: [{
              data: displayData,
            }],
          }}
          width={CHART_WIDTH}
          height={250}
          chartConfig={chartConfig}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={true}
          withShadow={false}
          fromZero={false}
          getDotColor={(dataPoint, dataPointIndex) => {
            const isSelected = tooltipData?.index === dataPointIndex;
            if (isSelected) {
              return isDark ? '#FFFFFF' : '#000000'; // Blanco en dark, negro en light
            }
            return getMetricColor(selectedMetric);
          }}
          getDotProps={(dataPoint, dataPointIndex) => {
            const isSelected = tooltipData?.index === dataPointIndex;
            return {
              r: isSelected ? '8' : '6', // Más grande si está seleccionado
              strokeWidth: isSelected ? '3' : '2',
              stroke: isSelected
                ? (isDark ? '#FFFFFF' : '#000000')
                : getMetricColor(selectedMetric),
            };
          }}
          onDataPointClick={(data) => {
            // data.index contiene el índice del punto clickeado
            // data.value contiene el valor del punto
            if (chartData && chartData.rawData && data.index < chartData.rawData.length) {
              const clickedMetric = chartData.rawData[data.index];
              const date = new Date(clickedMetric.date);
              const formattedDate = date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              setTooltipData({
                value: data.value,
                label: chartData.labels[data.index],
                date: formattedDate,
                index: data.index,
              });
            }
          }}
        />
      </View>
    );
  };

  // Renderizar gráfico de barras para medidas
  const renderMeasurementsChart = () => {
    if (!latestMetric) {
      return (
        <View
          className={`p-8 rounded-xl items-center justify-center ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
          }`}
          style={{ height: 250 }}
        >
          <Text className={`text-center text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No hay medidas registradas
          </Text>
          <Text className={`text-center text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Agrega medidas corporales en tus métricas
          </Text>
        </View>
      );
    }

    const measurements = [
      { label: 'Cintura', value: latestMetric.waist_cm },
      { label: 'Pecho', value: latestMetric.chest_cm },
      { label: 'Brazos', value: latestMetric.arms_cm },
    ].filter(m => m.value !== null && m.value !== undefined && Number(m.value) > 0);

    if (measurements.length === 0) {
      return (
        <View
          className={`p-8 rounded-xl items-center justify-center ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
          }`}
          style={{ height: 250 }}
        >
          <Text className={`text-center text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No hay medidas registradas
          </Text>
          <Text className={`text-center text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Agrega cintura, pecho o brazos en tus métricas
          </Text>
        </View>
      );
    }

    // BarChart necesita al menos 1 dato válido
    const barData = measurements.map(m => Number(m.value) || 0);

    // Agregar valor 0 como mínimo para que el gráfico tenga escala
    const minValue = Math.min(...barData);
    const maxValue = Math.max(...barData);
    const paddedData = [...barData];

    // Si todos los valores son iguales, agregar variación mínima
    if (minValue === maxValue) {
      paddedData.push(minValue * 0.95);
    }

    return (
      <View
        key={`measurements-${selectedMetric}`}
        className={`rounded-xl overflow-hidden ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
      >
        <BarChart
          data={{
            labels: measurements.map(m => m.label),
            datasets: [{
              data: paddedData,
            }],
          }}
          width={CHART_WIDTH}
          height={250}
          chartConfig={chartConfig}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          yAxisLabel=""
          yAxisSuffix=" cm"
          withInnerLines={false}
          fromZero={true}
          showBarTops={false}
          showValuesOnTopOfBars={true}
          onDataPointClick={(data) => {
            // Obtener la medida clickeada
            if (data.index < measurements.length) {
              const clickedMeasurement = measurements[data.index];
              const date = new Date(latestMetric.date);
              const formattedDate = date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              setTooltipData({
                value: data.value,
                label: clickedMeasurement.label,
                date: formattedDate,
              });
            }
          }}
        />
      </View>
    );
  };

  return (
    <View className="mb-6">
      {/* Título de la sección */}
      <View className="px-4 mb-4">
        <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Estadísticas de Progreso
        </Text>
        <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Últimos {period === '7d' ? '7 días' : period === '30d' ? '30 días' : period === '90d' ? '90 días' : '12 meses'}
        </Text>
      </View>

      {/* Selector de métrica */}
      <MetricSelector selected={selectedMetric} onSelect={setSelectedMetric} />

      {/* Contenedor con key para forzar remontaje */}
      <Animated.View key={`stats-${selectedMetric}`} style={animatedChartStyle} className="px-4">
        {/* Tarjeta de estadística resumen */}
        {selectedMetric !== 'measurements' && (
          <View className="mb-4">
            <StatsCard
              label={getLabel()}
              currentValue={currentValue}
              previousValue={previousValue}
              unit={getUnit()}
              decimals={selectedMetric === 'bodyFat' || selectedMetric === 'bmi' ? 1 : 1}
              higherIsBetter={selectedMetric === 'muscleMass'}
            />
          </View>
        )}

        {/* Resumen de medidas cuando la métrica es measurements */}
        {selectedMetric === 'measurements' && latestMetric && (
          <View className="mb-4">
            <View
              className={`rounded-xl p-4 ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Medidas corporales
              </Text>
              <View className="flex-row gap-3">
                {latestMetric.waist_cm && (
                  <View className="flex-1">
                    <Text className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Cintura
                    </Text>
                    <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {parseFloat(latestMetric.waist_cm.toString()).toFixed(0)}
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      cm
                    </Text>
                  </View>
                )}
                {latestMetric.chest_cm && (
                  <View className="flex-1">
                    <Text className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Pecho
                    </Text>
                    <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {parseFloat(latestMetric.chest_cm.toString()).toFixed(0)}
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      cm
                    </Text>
                  </View>
                )}
                {latestMetric.arms_cm && (
                  <View className="flex-1">
                    <Text className={`text-xs mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Brazos
                    </Text>
                    <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {parseFloat(latestMetric.arms_cm.toString()).toFixed(0)}
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      cm
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Gráfico */}
        {renderChart()}

        {/* Tooltip interactivo con animaciones */}
        {tooltipData && (
          <Animated.View
            style={[animatedTooltipStyle]}
            className={`mt-4 p-4 rounded-xl shadow-lg ${
              isDark ? 'bg-gray-800 border-2 border-gray-700' : 'bg-white border-2 border-gray-200'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {tooltipData.date}
                </Text>
                <View className="flex-row items-baseline mt-1">
                  <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {tooltipData.value.toFixed(selectedMetric === 'bodyFat' || selectedMetric === 'bmi' ? 1 : 1)}
                  </Text>
                  <Text className={`text-base ml-2 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {getUnit()}
                  </Text>
                </View>
              </View>
              <View
                className={`px-4 py-2 rounded-full ${
                  isDark ? 'bg-gray-700' : 'bg-gray-100'
                }`}
                style={{
                  shadowColor: getMetricColor(selectedMetric),
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Text
                  className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {tooltipData.label}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}
