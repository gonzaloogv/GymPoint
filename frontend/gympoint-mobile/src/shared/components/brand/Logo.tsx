import React from 'react';
import { View, ViewStyle } from 'react-native';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface LogoProps {
  size?: LogoSize;
  style?: ViewStyle;
}

const LOGO_SIZES: Record<LogoSize, { width: number; height: number }> = {
  xs: { width: 80, height: 75 },
  sm: { width: 120, height: 113 },
  md: { width: 160, height: 150 },
  lg: { width: 200, height: 188 },
  xl: { width: 256, height: 240 },
};

/**
 * Logo - Componente de marca de GymPoint
 *
 * Renderiza el logo SVG escalable en diferentes tamaños predefinidos.
 * Mantiene el aspect ratio correcto (512:481) del SVG original.
 *
 * @example
 * ```tsx
 * <Logo size="md" />
 * <Logo size="lg" style={{ marginBottom: 20 }} />
 * ```
 */
export const Logo: React.FC<LogoProps> = ({ size = 'md', style }) => {
  const GympointLogo = require('@assets/branding/gympoint-logo.svg').default;
  const { width, height } = LOGO_SIZES[size];

  return (
    <View style={[{ width, height }, style]}>
      <GympointLogo width={width} height={height} />
    </View>
  );
};