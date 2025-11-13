import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RatingStarsInputProps {
  value: number; // 1-5
  onChange: (rating: number) => void;
  size?: number;
  color?: string;
  emptyColor?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

/**
 * Componente para seleccionar rating con estrellas (interactivo)
 */
export function RatingStarsInput({
  value,
  onChange,
  size = 32,
  color = '#FCD34D', // yellow-300
  emptyColor = '#D1D5DB', // gray-300
  label,
  required = false,
  className,
}: RatingStarsInputProps) {
  return (
    <View className={className}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <Text className="text-red-500"> *</Text>}
        </Text>
      )}

      <View className="flex-row items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onChange(star)}
            activeOpacity={0.7}
            className="mr-2"
          >
            <Ionicons
              name={star <= value ? 'star' : 'star-outline'}
              size={size}
              color={star <= value ? color : emptyColor}
            />
          </TouchableOpacity>
        ))}

        {value > 0 && (
          <Text className="ml-2 text-base font-semibold text-gray-700 dark:text-gray-300">
            {value}/5
          </Text>
        )}
      </View>
    </View>
  );
}
