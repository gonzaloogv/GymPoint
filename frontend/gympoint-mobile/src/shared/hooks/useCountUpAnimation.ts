// src/shared/hooks/useCountUpAnimation.ts
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Hook para animar conteo de números de forma suave con React Native Animated
 * Usa interpolación suave para transiciones elegantes
 *
 * @param targetValue - Número objetivo
 * @param duration - Duración de la animación en ms (default: 600)
 * @param enabled - Si está habilitado (default: true)
 * @returns Animated.Value que se puede usar con Animated.Text
 *
 * @example
 * const animatedValue = useCountUpAnimation(balance);
 * return (
 *   <Animated.Text>
 *     {animatedValue.interpolate({
 *       inputRange: [0, balance],
 *       outputRange: ['0', balance.toString()],
 *     })}
 *   </Animated.Text>
 * );
 */
export function useCountUpAnimation(
  targetValue: number,
  duration: number = 600,
  enabled: boolean = true
): Animated.Value {
  const animatedValue = useRef(new Animated.Value(targetValue)).current;
  const previousValue = useRef(targetValue);

  useEffect(() => {
    if (!enabled) {
      animatedValue.setValue(targetValue);
      previousValue.current = targetValue;
      return;
    }

    // Si el valor no cambió, no animar
    if (previousValue.current === targetValue) {
      return;
    }

    // Animar desde el valor anterior al nuevo
    Animated.timing(animatedValue, {
      toValue: targetValue,
      duration,
      easing: Easing.out(Easing.cubic), // Suave y elegante
      useNativeDriver: false, // No se puede usar native driver para números
    }).start(() => {
      previousValue.current = targetValue;
    });
  }, [targetValue, duration, enabled, animatedValue]);

  return animatedValue;
}

/**
 * Hook para animar número con efecto de escala suave cuando cambia
 * Útil para destacar cambios importantes
 *
 * @param targetValue - Número objetivo
 * @returns { value: Animated.Value, scale: Animated.Value }
 *
 * @example
 * const { value, scale } = useCountUpWithPulse(tokenBalance);
 * return (
 *   <Animated.View style={{ transform: [{ scale }] }}>
 *     <AnimatedNumber value={value} />
 *   </Animated.View>
 * );
 */
export function useCountUpWithPulse(
  targetValue: number,
  options: {
    duration?: number;
    pulseScale?: number;
    pulseDuration?: number;
  } = {}
) {
  const { duration = 600, pulseScale = 1.1, pulseDuration = 200 } = options;

  const animatedValue = useCountUpAnimation(targetValue, duration);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const previousValue = useRef(targetValue);

  useEffect(() => {
    if (previousValue.current === targetValue) {
      return;
    }

    // Efecto de pulso suave
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: pulseScale,
        duration: pulseDuration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: pulseDuration,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    previousValue.current = targetValue;
  }, [targetValue, scaleValue, pulseScale, pulseDuration]);

  return {
    value: animatedValue,
    scale: scaleValue,
  };
}

/**
 * Hook para animar opacidad (fade in/out) cuando cambia un valor
 *
 * @param value - Valor que dispara la animación
 * @returns Animated.Value para opacidad
 */
export function useFadeOnChange(value: any, duration: number = 300): Animated.Value {
  const opacity = useRef(new Animated.Value(1)).current;
  const previousValue = useRef(value);

  useEffect(() => {
    if (previousValue.current === value) {
      return;
    }

    // Fade out y luego fade in
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0.4,
        duration: duration / 2,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    previousValue.current = value;
  }, [value, opacity, duration]);

  return opacity;
}
