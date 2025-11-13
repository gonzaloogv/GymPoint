import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export interface StatsAnimationValues {
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  scaleAnim: Animated.Value;
}

/**
 * Hook personalizado para animaciones de estadísticas
 * Proporciona animaciones de entrada suaves para los componentes de gráficos
 *
 * @param trigger - Valor que dispara la reanimación cuando cambia
 * @returns Valores animados para fade, slide y scale
 */
export function useStatsAnimation(trigger?: any): StatsAnimationValues {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.95);

    // Run parallel animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      // Cleanup: stop animations when unmounting
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      scaleAnim.stopAnimation();
    };
  }, [trigger]);

  return { fadeAnim, slideAnim, scaleAnim };
}

/**
 * Hook para animar números que cambian (contador)
 * Útil para mostrar deltas o cambios en valores
 *
 * @param endValue - Valor final del contador
 * @param duration - Duración de la animación en ms (default: 1000)
 */
export function useCounterAnimation(endValue: number, duration: number = 1000) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: endValue,
      duration,
      useNativeDriver: false, // No se puede usar con interpolación de números
    }).start();
  }, [endValue]);

  return animatedValue;
}
