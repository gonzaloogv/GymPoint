import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import type { MapLocation } from "@features/gyms/presentation/types";
import GymsPin from "../../../../assets/icons/gyms.min.svg";

type Props = {
  location: MapLocation;
};

/**
 * MapMarker - Marcador personalizado para mostrar gimnasios en el mapa
 * Usa el SVG predefinido sin escalado dinámico.
 */
function MapMarkerComponent({ location }: Props) {
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

  const size = 41; // tamaño fijo del asset

  return (
    <Marker
      key={location.id}
      coordinate={location.coordinate}
      title={location.title}
      anchor={{ x: 0.5, y: 1 }} // punta abajo
      tracksViewChanges={tracksViewChanges}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <GymsPin width={size} height={size} />
    </Marker>
  );
}

export const MapMarker = React.memo(
  MapMarkerComponent,
  (prevProps, nextProps) => {
    return prevProps.location.id === nextProps.location.id;
  }
);
