import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@shared/hooks';

interface InfoCardProps extends Omit<ViewProps, 'children'> {
  children: React.ReactNode;
  /**
   * Variant controls the border radius
   * default: rounded-[28px] (like DailyChallengeCard)
   * compact: rounded-[24px] (for smaller cards)
   */
  variant?: 'default' | 'compact';
}

/**
 * InfoCard - Componente reutilizable para cards de información
 * Sigue el mismo patrón visual de DailyChallengeCard y WeeklyProgressCard
 *
 * Features:
 * - Border visible con color consistente
 * - Shadow personalizada (light/dark mode)
 * - Padding estandarizado: px-5 py-[18px]
 * - Border radius: rounded-[28px] (default) o rounded-[24px] (compact)
 */
export function InfoCard({ children, variant = 'default', className = '', style, ...props }: InfoCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const shadowStyle = isDark
    ? {
        shadowColor: '#000000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 18 },
        shadowRadius: 24,
        elevation: 12,
      }
    : {
        shadowColor: '#4338CA',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 18,
        elevation: 6,
      };

  const borderColor = isDark ? 'rgba(55, 65, 81, 0.8)' : '#E5E7EB';
  const backgroundColor = isDark ? '#111827' : '#ffffff';
  const borderRadius = variant === 'compact' ? 'rounded-[24px]' : 'rounded-[28px]';

  const computedStyle = StyleSheet.flatten([
    {
      borderColor,
      backgroundColor,
    },
    shadowStyle,
    style,
  ]);

  return (
    <View
      className={`border ${borderRadius} px-5 py-[18px] ${className}`.trim()}
      style={computedStyle}
      {...props}
    >
      {children}
    </View>
  );
}
