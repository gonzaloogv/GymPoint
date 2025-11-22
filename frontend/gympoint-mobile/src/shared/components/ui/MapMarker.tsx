import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import type { MapLocation } from "@features/gyms/presentation/types";
import { GymPin, GYM_PIN_ANCHOR_Y } from "./GymPin";

type Props = {
  location: MapLocation;
  pinSize?: number;
  scale?: number;
};

/**
 * MapMarker - Marcador personalizado para mostrar gimnasios en el mapa
 * Soporta tamaño dinámico según nivel de zoom
 */
function MapMarkerComponent({ location, pinSize = 48, scale = 1.0 }: Props) {
  // Para Android: mantener tracksViewChanges=true para evitar clipping de bitmap
  // Para iOS: desactivar después de carga inicial para mejor rendimiento
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  if (Platform.OS === "web") {
    return null;
  }

  // Importación dinámica solo para plataformas nativas
  let Marker;
  try {
    const RNMaps = require("react-native-maps");
    Marker = RNMaps.Marker || RNMaps.default.Marker;
  } catch (error) {
    console.warn("react-native-maps no está disponible:", error);
    return null;
  }

  // Solo para iOS: desactivar tracking después de animación inicial (2s)
  useEffect(() => {
    if (Platform.OS === 'ios') {
      const timer = setTimeout(() => {
        setTracksViewChanges(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  // Solo para iOS: re-activar tracking cuando cambia el tamaño
  useEffect(() => {
    if (Platform.OS === 'ios') {
      setTracksViewChanges(true);
      const timer = setTimeout(() => {
        setTracksViewChanges(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [pinSize, scale]);

  return (
    <Marker
      key={location.id}
      coordinate={location.coordinate}
      title={location.title}
      anchor={{ x: 0.5, y: GYM_PIN_ANCHOR_Y }} // Ajustado al padding extra para evitar recorte en Android
      tracksViewChanges={tracksViewChanges}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <GymPin size={pinSize} scale={scale} />
    </Marker>
  );
}

export const MapMarker = React.memo(
  MapMarkerComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.location.id === nextProps.location.id &&
      prevProps.pinSize === nextProps.pinSize &&
      prevProps.scale === nextProps.scale
    );
  }
);
