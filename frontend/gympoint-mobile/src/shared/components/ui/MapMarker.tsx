import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import type { MapLocation } from "@features/gyms/presentation/types";
import { GymPin } from "./GymPin";

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
    }, 500);

    return () => clearTimeout(timer);
  }, [pinSize, scale]);

  const effectiveSize = pinSize * scale;
  // Compensar el padding del GymPin (0.5 * effectiveSize)
  // CenterOffset (iOS): Desplazar el centro hacia arriba
  const yOffset = -(effectiveSize * 0.5);

  return (
    <Marker
      key={location.id}
      coordinate={location.coordinate}
      title={location.title}
      anchor={{ x: 0.5, y: 0.75 }} // Android: 0.75 es el punto donde termina el pin visualmente (padding es 0.5, size es 1.0 -> total 2.0. Tip at 1.5. 1.5/2.0 = 0.75)
      centerOffset={{ x: 0, y: yOffset }}
      tracksViewChanges={tracksViewChanges}
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
