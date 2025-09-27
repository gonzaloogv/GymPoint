// src/features/gyms/ui/GymsMap.tsx
import React from 'react';
import { Platform, View, Text, StyleProp, ViewStyle } from 'react-native';

type Gym = { id: string; title: string; coordinate: { latitude: number; longitude: number } };

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type LatLng = { latitude: number; longitude: number };

type Props = {
  initialRegion: Region;
  locations: Gym[];
  style?: StyleProp<ViewStyle>;

  /** ✅ NUEVO: ubicación del usuario para centrar y/o mostrar el punto azul */
  userLocation?: LatLng;

  /** ✅ NUEVO (opcional): auto-centrar al usuario cuando cambia */
  animateToUserOnChange?: boolean;

  /** ✅ NUEVO (opcional): zoom a usar cuando centra en el usuario */
  zoomDelta?: number;
};

export default function GymsMap({
  initialRegion,
  locations,
  style,
  userLocation,
  animateToUserOnChange = true,
  zoomDelta = 0.01,
}: Props) {
  if (Platform.OS === 'web') {
    // Placeholder en web para evitar el import de módulos nativos
    return (
      <View
        style={[
          {
            width: '100%',
            height: 250,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#ddd',
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
          },
          style,
        ]}
      >
        <Text>Mapa no disponible en Web con react-native-maps</Text>
      </View>
    );
  }

  // Carga perezosa solo en iOS/Android
  const RNMaps = require('react-native-maps');
  const MapView = RNMaps.default;
  const Marker = RNMaps.Marker || RNMaps.default.Marker;

  // ✅ Ref interno para animar cuando llega la ubicación del usuario
  const mapRef = React.useRef<any>(null);

  // ✅ Si tengo userLocation, armo una Region válida con deltas; si no, uso la que llega por props
  const startRegion: Region = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: zoomDelta,
        longitudeDelta: zoomDelta,
      }
    : initialRegion;

  // ✅ Al montar el mapa, si tengo userLocation, me aseguro de animar al centro
  const onMapReady = React.useCallback(() => {
    if (mapRef.current && userLocation && animateToUserOnChange) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: zoomDelta,
          longitudeDelta: zoomDelta,
        },
        400
      );
    }
  }, [userLocation, animateToUserOnChange, zoomDelta]);

  // ✅ Si cambia userLocation (llega más tarde), centro el mapa de nuevo
  React.useEffect(() => {
    if (!animateToUserOnChange || !userLocation || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: zoomDelta,
        longitudeDelta: zoomDelta,
      },
      500
    );
  }, [userLocation, animateToUserOnChange, zoomDelta]);

  return (
    <MapView
      ref={mapRef}
      initialRegion={startRegion}
      onMapReady={onMapReady}
      onLayout={onMapReady}  // ✅ fallback: anima también cuando el layout se montó
      style={[{ width: '100%', height: 250, borderRadius: 12, overflow: 'hidden' }, style]}
      showsUserLocation={!!userLocation}
      showsMyLocationButton={true}
    >
      {locations.map((g) => (
        <Marker key={g.id} coordinate={g.coordinate} title={g.title} />
      ))}

      {/** Si preferís un Marker custom para el usuario, descomentá:
      {userLocation && (
        <Marker
          coordinate={userLocation}
          title="Tu ubicación"
          pinColor="#635BFF"
        />
      )} */}
    </MapView>
  );
}
