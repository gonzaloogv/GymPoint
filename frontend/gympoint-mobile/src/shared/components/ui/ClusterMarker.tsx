import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@shared/hooks';
import Svg, { Circle } from 'react-native-svg';

interface ClusterMarkerProps {
  count: number;
  onPress?: () => void;
}

/**
 * ClusterMarker - Marcador que representa un grupo de gimnasios
 * Muestra la cantidad de gimnasios agrupados
 */
export function ClusterMarker({ count }: ClusterMarkerProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Calcular tamaño según cantidad
  const getSize = () => {
    if (count < 10) return 50;
    if (count < 50) return 60;
    if (count < 100) return 70;
    return 80;
  };

  const size = getSize();
  const radius = size / 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Círculo exterior (sombra/glow) */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={radius}
          cy={radius}
          r={radius}
          fill={isDark ? 'rgba(67, 173, 255, 0.2)' : 'rgba(67, 173, 255, 0.15)'}
        />
      </Svg>

      {/* Círculo principal */}
      <View
        style={{
          width: size * 0.7,
          height: size * 0.7,
          borderRadius: (size * 0.7) / 2,
          backgroundColor: '#43adff',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 3,
          borderColor: '#ffffff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Text
          style={{
            color: '#ffffff',
            fontSize: size * 0.25,
            fontWeight: 'bold',
          }}
        >
          {count}
        </Text>
      </View>
    </View>
  );
}
