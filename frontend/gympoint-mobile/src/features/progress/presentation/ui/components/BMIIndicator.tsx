import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { useTheme } from '@shared/hooks';

interface BMIRange {
  min: number;
  max: number;
  label: string;
  color: string;
  colorDark: string;
}

const BMI_RANGES: BMIRange[] = [
  { min: 0, max: 18.5, label: 'Bajo peso', color: '#F59E0B', colorDark: '#FBBF24' },
  { min: 18.5, max: 25, label: 'Normal', color: '#10B981', colorDark: '#34D399' },
  { min: 25, max: 30, label: 'Sobrepeso', color: '#F59E0B', colorDark: '#FBBF24' },
  { min: 30, max: 50, label: 'Obesidad', color: '#EF4444', colorDark: '#F87171' },
];

const MIN_BMI = 15;
const MAX_BMI = 40;

interface BMIIndicatorProps {
  bmi: number | null;
}

export function BMIIndicator({ bmi }: BMIIndicatorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const indicatorPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (bmi !== null) {
      // Calcular posición del indicador (0-100%)
      const clampedBMI = Math.max(MIN_BMI, Math.min(MAX_BMI, bmi));
      const position = ((clampedBMI - MIN_BMI) / (MAX_BMI - MIN_BMI)) * 100;

      Animated.spring(indicatorPosition, {
        toValue: position,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [bmi]);

  if (bmi === null) {
    return (
      <View
        className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
        }`}
      >
        <Text className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Sin datos de IMC disponibles
        </Text>
      </View>
    );
  }

  // Encontrar el rango del BMI actual
  const currentRange = BMI_RANGES.find(range => bmi >= range.min && bmi < range.max) || BMI_RANGES[BMI_RANGES.length - 1];

  return (
    <View
      className={`p-6 rounded-xl ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}
    >
      {/* Header */}
      <View className="mb-4">
        <Text className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Índice de Masa Corporal
        </Text>
        <View className="flex-row items-baseline">
          <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {bmi.toFixed(1)}
          </Text>
          <Text
            className="ml-3 text-sm font-semibold px-3 py-1 rounded-full"
            style={{
              backgroundColor: isDark ? currentRange.colorDark + '20' : currentRange.color + '20',
              color: isDark ? currentRange.colorDark : currentRange.color,
            }}
          >
            {currentRange.label}
          </Text>
        </View>
      </View>

      {/* Barra horizontal con zonas de color */}
      <View className="mb-4">
        {/* Barra de fondo con gradientes */}
        <View className="h-8 rounded-full overflow-hidden flex-row">
          {BMI_RANGES.map((range, index) => {
            const width = ((range.max - range.min) / (MAX_BMI - MIN_BMI)) * 100;
            return (
              <View
                key={index}
                style={{
                  width: `${width}%`,
                  backgroundColor: isDark ? range.colorDark : range.color,
                  opacity: 0.3,
                }}
              />
            );
          })}
        </View>

        {/* Indicador animado */}
        <Animated.View
          className="absolute top-0 h-8 w-1 rounded-full"
          style={{
            left: indicatorPosition.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            backgroundColor: isDark ? '#FFFFFF' : '#000000',
            transform: [{ translateX: -2 }],
          }}
        />

        {/* Punto indicador */}
        <Animated.View
          className="absolute -top-2 w-3 h-3 rounded-full border-2"
          style={{
            left: indicatorPosition.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            backgroundColor: isDark ? currentRange.colorDark : currentRange.color,
            borderColor: isDark ? '#FFFFFF' : '#000000',
            transform: [{ translateX: -6 }],
          }}
        />
      </View>

      {/* Labels de rangos */}
      <View className="flex-row justify-between">
        {BMI_RANGES.map((range, index) => (
          <View key={index} className="items-center" style={{ flex: 1 }}>
            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {range.label}
            </Text>
            <Text className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {range.min.toFixed(1)}-{range.max.toFixed(1)}
            </Text>
          </View>
        ))}
      </View>

      {/* Mensaje de recomendación */}
      <View
        className={`mt-4 p-3 rounded-lg ${
          isDark ? 'bg-gray-700/50' : 'bg-gray-50'
        }`}
      >
        <Text className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {bmi < 18.5 && '💡 Un IMC bajo puede indicar desnutrición. Consulta con un profesional de la salud.'}
          {bmi >= 18.5 && bmi < 25 && '✅ Tu IMC está en el rango saludable. ¡Sigue así!'}
          {bmi >= 25 && bmi < 30 && '⚠️ IMC en sobrepeso. Considera mejorar tu alimentación y actividad física.'}
          {bmi >= 30 && '🔴 IMC en obesidad. Es importante consultar con un profesional de la salud.'}
        </Text>
      </View>
    </View>
  );
}
