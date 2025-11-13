import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { MapLocation } from '@features/gyms/presentation/types';
import { GymPin } from './GymPin';

// Importar Marker de forma estática (solo en plataformas nativas)
let Marker: any = null;
if (Platform.OS !== 'web') {
  try {
    const MapView = require('react-native-maps');
    Marker = MapView.Marker;
    if (!Marker) {
      console.warn('[MapMarker] ⚠️ Marker no está disponible en react-native-maps');
    }
  } catch (error) {
    console.warn('[MapMarker] ⚠️ Error importando react-native-maps:', error);
  }
}

type Props = {
  location: MapLocation;
  pinSize?: number;
  scale?: number;
};

/**
 * MapMarker - Marcador personalizado para mostrar gimnasios en el mapa
 * Soporta tamaño dinámico según nivel de zoom
 *
 * @param location - Datos de ubicación del gimnasio
 * @param pinSize - Tamaño base del pin (default: 48)
 * @param scale - Factor de escala para zoom adaptativo (default: 1.0)
 */
function MapMarkerComponent({ location, pinSize = 48, scale = 1.0 }: Props) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  if (Platform.OS === 'web') {
    return null;
  }

  // Validar que las coordenadas sean válidas antes de renderizar
  if (!location.coordinate ||
      typeof location.coordinate.latitude !== 'number' ||
      typeof location.coordinate.longitude !== 'number' ||
      !isFinite(location.coordinate.latitude) ||
      !isFinite(location.coordinate.longitude)) {
    console.warn('[MapMarker] ⚠️ Coordenadas inválidas para location:', {
      locationId: location.id,
      title: location.title,
      coordinate: location.coordinate,
      latType: typeof location.coordinate?.latitude,
      lngType: typeof location.coordinate?.longitude,
      latIsFinite: Number.isFinite(location.coordinate?.latitude),
      lngIsFinite: Number.isFinite(location.coordinate?.longitude),
    });
    return null;
  }

  // Debug: Log valid coordinates being rendered
  console.log('[MapMarker] ✅ Rendering marker:', {
    locationId: location.id,
    title: location.title,
    lat: location.coordinate.latitude,
    lng: location.coordinate.longitude,
  });

  // Verificar que Marker está disponible (importado en el scope global)
  if (!Marker) {
    console.warn('[MapMarker] ⚠️ Marker component not available');
    return null;
  }

  // Desactivar tracking después de animación inicial (2s)
  useEffect(() => {
    const timer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Re-activar tracking cuando cambia el tamaño (para animación de resize)
  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 500); // Tiempo para animación de cambio de tamaño

    return () => clearTimeout(timer);
  }, [pinSize, scale]);

  // Calcular offset basado en el tamaño efectivo
  const effectiveSize = pinSize * scale;
  const yOffset = -(effectiveSize / 2);

  return (
    <Marker
      key={location.id}
      coordinate={location.coordinate}
      title={location.title}
      anchor={{ x: 0.5, y: 1 }}
      centerOffset={{ x: 0, y: yOffset }}
      tracksViewChanges={tracksViewChanges}
    >
      <GymPin size={pinSize} scale={scale} />
    </Marker>
  );
}

// Memoización para evitar re-renders innecesarios
export const MapMarker = React.memo(
  MapMarkerComponent,
  (prevProps, nextProps) => {
    // Retorna true si props son iguales (evita re-render)
    return (
      prevProps.location.id === nextProps.location.id &&
      prevProps.pinSize === nextProps.pinSize &&
      prevProps.scale === nextProps.scale
    );
  }
);
