// src/shared/components/ui/AnimatedNumber.tsx
import React, { useEffect, useState } from 'react';
import { Animated, TextStyle, ViewStyle } from 'react-native';
import { useTheme } from '@shared/hooks';
import { useCountUpAnimation, useCountUpWithPulse } from '@shared/hooks/useCountUpAnimation';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  style?: TextStyle;
  containerStyle?: ViewStyle;
  withPulse?: boolean;
  separator?: string;
}

/**
 * Componente que anima números de forma suave
 * Simple, elegante y limpio
 *
 * @example
 * // Básico
 * <AnimatedNumber value={tokenBalance} />
 *
 * @example
 * // Con formato
 * <AnimatedNumber
 *   value={price}
 *   prefix="$"
 *   decimals={2}
 *   separator=","
 * />
 *
 * @example
 * // Con pulso cuando cambia
 * <AnimatedNumber
 *   value={tokens}
 *   withPulse
 *   style={{ fontSize: 32, fontWeight: 'bold' }}
 * />
 */
export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 600,
  style,
  containerStyle,
  withPulse = false,
  separator = ',',
}: AnimatedNumberProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Usar hook con o sin pulso
  const animation = withPulse
    ? useCountUpWithPulse(value, { duration })
    : { value: useCountUpAnimation(value, duration), scale: new Animated.Value(1) };

  // Estado local para el valor formateado
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    const listenerId = animation.value.addListener(({ value: animatedValue }) => {
      const formatted = formatNumber(animatedValue, decimals, separator);
      setDisplayValue(formatted);
    });

    // Limpiar listener
    return () => {
      animation.value.removeListener(listenerId);
    };
  }, [animation.value, decimals, separator]);

  const defaultColor = isDark ? '#ffffff' : '#000000';

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          transform: [{ scale: animation.scale }],
        },
      ]}
    >
      <Animated.Text
        style={[
          {
            color: defaultColor,
            fontSize: 16,
            fontWeight: '400',
          },
          style,
        ]}
      >
        {prefix}
        {displayValue}
        {suffix}
      </Animated.Text>
    </Animated.View>
  );
}

/**
 * Variante para números grandes (como tokens, stats)
 */
export function AnimatedNumberLarge({
  value,
  prefix = '',
  suffix = '',
  style,
  withPulse = true,
}: Omit<AnimatedNumberProps, 'decimals' | 'separator'>) {
  return (
    <AnimatedNumber
      value={value}
      prefix={prefix}
      suffix={suffix}
      decimals={0}
      separator=","
      withPulse={withPulse}
      style={[
        {
          fontSize: 32,
          fontWeight: '700',
        },
        style,
      ]}
    />
  );
}

/**
 * Variante para precios/moneda
 */
export function AnimatedPrice({
  value,
  currency = '$',
  style,
}: {
  value: number;
  currency?: string;
  style?: TextStyle;
}) {
  return (
    <AnimatedNumber
      value={value}
      prefix={currency}
      decimals={2}
      separator=","
      withPulse={false}
      style={[
        {
          fontSize: 20,
          fontWeight: '600',
        },
        style,
      ]}
    />
  );
}

/**
 * Variante para porcentajes
 */
export function AnimatedPercentage({
  value,
  style,
}: {
  value: number;
  style?: TextStyle;
}) {
  return (
    <AnimatedNumber
      value={value}
      suffix="%"
      decimals={1}
      withPulse={false}
      style={[
        {
          fontSize: 18,
          fontWeight: '500',
        },
        style,
      ]}
    />
  );
}

// ========== HELPERS ==========

/**
 * Formatea un número con decimales y separador de miles
 */
function formatNumber(num: number, decimals: number, separator: string): string {
  const fixed = num.toFixed(decimals);
  const [integerPart, decimalPart] = fixed.split('.');

  // Agregar separador de miles
  const withSeparator = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  // Retornar con o sin decimales
  return decimalPart ? `${withSeparator}.${decimalPart}` : withSeparator;
}
