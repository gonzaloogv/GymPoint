import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RatingStarsProps {
  rating: number; // 1.0-5.0
  size?: number;
  showNumber?: boolean;
  color?: string;
  emptyColor?: string;
  className?: string;
}

/**
 * Componente para mostrar estrellas de rating (solo lectura)
 */
export function RatingStars({
  rating,
  size = 16,
  showNumber = true,
  color = '#FCD34D', // yellow-300
  emptyColor = '#6B7280', // gray-500
  className,
}: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View className={`flex-row items-center ${className || ''}`}>
      {/* Estrellas llenas */}
      {[...Array(fullStars)].map((_, i) => (
        <Ionicons key={`full-${i}`} name="star" size={size} color={color} />
      ))}

      {/* Media estrella */}
      {hasHalfStar && <Ionicons name="star-half" size={size} color={color} />}

      {/* Estrellas vacías */}
      {[...Array(emptyStars)].map((_, i) => (
        <Ionicons key={`empty-${i}`} name="star-outline" size={size} color={emptyColor} />
      ))}

      {/* Número de rating */}
      {showNumber && (
        <Text className="ml-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}
