import { useState, useCallback, useRef } from 'react';
import type { Region } from '../types';

/**
 * Hook para gestionar niveles de zoom del mapa y calcular tamaños de pin adaptativos
 *
 * Estrategia:
 * - latitudeDelta representa el nivel de zoom (menor = más zoom)
 * - Definimos rangos de zoom: very-close, close, medium, far, very-far
 * - Cada rango tiene un tamaño de pin específico
 * - Se implementa throttling (200ms) para optimizar performance
 */

type ZoomLevel = 'very-close' | 'close' | 'medium' | 'far' | 'very-far';

type ZoomState = {
  level: ZoomLevel;
  pinSize: number;
  scale: number; // Factor de escala (0.5 - 1.5)
};

// Configuración de rangos de zoom
const ZOOM_CONFIG = {
  'very-close': { maxDelta: 0.005, pinSize: 64, scale: 1.5 }, // Muy cerca
  'close': { maxDelta: 0.02, pinSize: 56, scale: 1.2 }, // Cerca
  'medium': { maxDelta: 0.05, pinSize: 48, scale: 1.0 }, // Medio (default)
  'far': { maxDelta: 0.15, pinSize: 40, scale: 0.8 }, // Lejos
  'very-far': { maxDelta: Infinity, pinSize: 32, scale: 0.6 }, // Muy lejos
} as const;

const THROTTLE_MS = 200; // Actualizar como máximo cada 200ms

export function useMapZoom() {
  const [zoomState, setZoomState] = useState<ZoomState>({
    level: 'medium',
    pinSize: 48,
    scale: 1.0,
  });

  const lastUpdateRef = useRef<number>(0);

  /**
   * Calcula el nivel de zoom basado en latitudeDelta
   * latitudeDelta pequeño = más zoom (cerca)
   * latitudeDelta grande = menos zoom (lejos)
   */
  const calculateZoomLevel = useCallback((latitudeDelta: number): ZoomLevel => {
    if (latitudeDelta <= ZOOM_CONFIG['very-close'].maxDelta) return 'very-close';
    if (latitudeDelta <= ZOOM_CONFIG['close'].maxDelta) return 'close';
    if (latitudeDelta <= ZOOM_CONFIG['medium'].maxDelta) return 'medium';
    if (latitudeDelta <= ZOOM_CONFIG['far'].maxDelta) return 'far';
    return 'very-far';
  }, []);

  /**
   * Maneja cambios de región del mapa
   * Se llama cuando el usuario hace zoom o pan
   * Implementa throttling para evitar updates excesivos
   */
  const handleRegionChange = useCallback(
    (region: Region) => {
      const now = Date.now();

      // Throttling simple: solo actualizar si han pasado 200ms desde la última actualización
      if (now - lastUpdateRef.current < THROTTLE_MS) {
        return;
      }

      lastUpdateRef.current = now;

      const level = calculateZoomLevel(region.latitudeDelta);
      const config = ZOOM_CONFIG[level];

      setZoomState({
        level,
        pinSize: config.pinSize,
        scale: config.scale,
      });
    },
    [calculateZoomLevel]
  );

  return {
    zoomState,
    handleRegionChange,
  };
}
