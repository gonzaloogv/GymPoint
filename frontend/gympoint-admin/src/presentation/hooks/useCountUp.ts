import { useState, useEffect, useRef } from 'react';

/**
 * Hook para animar conteo de números de forma suave
 * Útil para mostrar cambios en estadísticas sin pestañeo
 *
 * @param target - Número objetivo
 * @param duration - Duración de la animación en ms (default: 500)
 * @param enabled - Si está habilitado (default: true)
 * @returns Número actual animado
 *
 * @example
 * const animatedBalance = useCountUp(balance, 800);
 * return <span>{animatedBalance}</span>
 */
export function useCountUp(
  target: number,
  duration: number = 500,
  enabled: boolean = true
): number {
  const [count, setCount] = useState(target);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(target);

  useEffect(() => {
    if (!enabled) {
      setCount(target);
      return;
    }

    // Si el valor no cambió, no animar
    if (startValueRef.current === target) {
      return;
    }

    // Cancelar animación anterior si existe
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    startValueRef.current = count;
    startTimeRef.current = null;

    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (easeOutCubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValueRef.current + (target - startValueRef.current) * easeOut;
      setCount(Math.floor(currentValue));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target); // Asegurar que termina en el valor exacto
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration, enabled]);

  return count;
}

/**
 * Hook para animar números con formato (decimales, moneda, etc.)
 *
 * @param target - Número objetivo
 * @param options - Opciones de formato
 * @returns String formateado y animado
 *
 * @example
 * const animatedPrice = useCountUpFormatted(price, {
 *   decimals: 2,
 *   prefix: '$',
 *   separator: ','
 * });
 */
export function useCountUpFormatted(
  target: number,
  options: {
    decimals?: number;
    prefix?: string;
    suffix?: string;
    separator?: string;
    duration?: number;
  } = {}
): string {
  const {
    decimals = 0,
    prefix = '',
    suffix = '',
    separator = ',',
    duration = 500,
  } = options;

  const animatedValue = useCountUp(target, duration);

  // Formatear el número
  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    const decimalPart = parts[1] ? `.${parts[1]}` : '';

    return `${prefix}${integerPart}${decimalPart}${suffix}`;
  };

  return formatNumber(animatedValue);
}
