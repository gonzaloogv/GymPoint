import React from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';

import { useTheme } from '@shared/hooks'; // Correcto: usando tu hook de contexto

interface Props {
  value: number;
  onChange: (frequency: number) => void;
  className?: string;
}

export const FrequencySlider: React.FC<Props> = ({
  value,
  onChange,
  className = '',
}) => {
  const { isDark } = useTheme(); // Obtenemos 'isDark' directamente de nuestro hook

  // --- Valores de color directos desde tailwind.config.js ---
  // El componente Slider no acepta className, por lo que pasamos los colores como props.
  const minTrackColor = '#4A9CF5'; // colors.primary
  const maxTrackColor = isDark
    ? '#252B3D' // colors.surfaceVariant.dark
    : '#F5F5F5'; // colors.surfaceVariant.DEFAULT

  // --- Clases de Nativewind para los componentes de texto ---
  const selectedLabelClasses = 'font-semibold text-primary';
  const unselectedLabelClasses = isDark
    ? 'text-textSecondary-dark'
    : 'text-textSecondary';

  // Helper para renderizar las etiquetas de los extremos
  const renderLabel = (day: number, text: string) => {
    const isSelected = value === day;
    return (
      <Text className={isSelected ? selectedLabelClasses : unselectedLabelClasses}>
        {text}
      </Text>
    );
  };

  return (
    <View className={`gap-2 ${className}`}>
      <View className="px-1">
        <Slider
          value={value}
          onValueChange={onChange}
          minimumValue={1}
          maximumValue={7}
          step={1}
          minimumTrackTintColor={minTrackColor}
          maximumTrackTintColor={maxTrackColor}
          thumbTintColor={minTrackColor} // Hacemos que el pulgar coincida con el color primario
        />
      </View>
      <View className="flex-row justify-between px-2">
        {renderLabel(1, '1 día')}
        <Text className={unselectedLabelClasses}>
          {`${value} ${value === 1 ? 'día' : 'días'}`}
        </Text>
        {renderLabel(7, '7 días')}
      </View>
    </View>
  );
};