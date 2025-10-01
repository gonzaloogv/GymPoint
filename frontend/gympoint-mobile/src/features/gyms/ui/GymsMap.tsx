// src/features/gyms/ui/GymsMap.tsx
import React from 'react';
import { Platform, View, Text, StyleProp, ViewStyle, Animated } from 'react-native';

type Gym = {
  id: string;
  title: string;
  coordinate: { latitude: number; longitude: number };
};

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
  userLocation?: LatLng;

  /** auto-centrar al usuario cuando cambia */
  animateToUserOnChange?: boolean;

  /** zoom cuando centra */
  zoomDelta?: number;

  /** mostrar un pin custom del user si el punto azul no aparece */
  showUserFallbackPin?: boolean;

  /** altura del mapa (para hacerlo más grande) */
  mapHeight?: number;

  /** (opcional) Mostrar una etiqueta de debug con coords del usuario */
  debugUser?: boolean;
};

export default function GymsMap({
  initialRegion,
  locations,
  style,
  userLocation,
  animateToUserOnChange = true,
  zoomDelta = 0.01,
  showUserFallbackPin = true,
  mapHeight = 360,
  debugUser = false,
}: Props) {
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          {
            width: '100%',
            height: mapHeight,
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

  const RNMaps = require('react-native-maps');
  const MapView = RNMaps.default;
  const Marker = RNMaps.Marker || RNMaps.default.Marker;

  const mapRef = React.useRef<any>(null);

  // Si tengo userLocation, arranco centrado ahí
  const startRegion: Region = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: zoomDelta,
        longitudeDelta: zoomDelta,
      }
    : initialRegion;

  const onMapReady = React.useCallback(() => {
    if (mapRef.current && userLocation && animateToUserOnChange) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: zoomDelta,
          longitudeDelta: zoomDelta,
        },
        450,
      );
    }
  }, [userLocation, animateToUserOnChange, zoomDelta]);

  React.useEffect(() => {
    if (!animateToUserOnChange || !userLocation || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: zoomDelta,
        longitudeDelta: zoomDelta,
      },
      500,
    );
  }, [userLocation, animateToUserOnChange, zoomDelta]);

  // ==== Animación suave del pin custom del user ====
  const scale = React.useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.2, duration: 900, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);

  // Para Android (y a veces iOS), evitar que el Image no renderice o se quede “difuso”
  const [tracksViewChanges, setTracksViewChanges] = React.useState(true);
  const handleUserMarkerLayout = React.useCallback(() => {
    // pequeño delay para permitir pintar y luego apagar tracking
    setTimeout(() => setTracksViewChanges(false), 300);
  }, []);

  // OJO con la ruta del require(): desde src/features/gyms/ui/GymsMap.tsx a /assets/ubication.png
  // Ruta típica: subir 4 niveles: ../../../../assets/ubication.png
  let userPinSource;
  try {
    userPinSource = require('../../../../assets/ubication.png');
  } catch {
    // fallback si la ruta no existe — al menos no rompe
    userPinSource = undefined;
  }

  return (
    <MapView
      ref={mapRef}
      initialRegion={startRegion}
      onMapReady={onMapReady}
      onLayout={onMapReady}
      style={[
        { width: '100%', height: mapHeight, borderRadius: 12, overflow: 'hidden' },
        style,
      ]}
      showsUserLocation={true} // punto azul nativo
      showsMyLocationButton={true} // botón nativo (Android)
    >
      {/* Marcadores de gimnasios */}
      {locations.map((g) => (
        <Marker key={g.id} coordinate={g.coordinate} title={g.title} />
      ))}

      {/* Fallback custom del usuario */}
      {userLocation && showUserFallbackPin && userPinSource && (
        <Marker
          coordinate={userLocation}
          title="Tu ubicación"
          anchor={{ x: 0.5, y: 0.5 }}
          flat
          zIndex={9999}
          tracksViewChanges={tracksViewChanges}
          onLayout={handleUserMarkerLayout}
        >
          <Animated.Image
            source={userPinSource}
            style={{ width: 30, height: 30, transform: [{ scale }] }}
            resizeMode="contain"
          />
        </Marker>
      )}

      {/* Debug overlay */}
      {debugUser && userLocation && (
        <Marker coordinate={userLocation}>
          <View style={{ backgroundColor: '#fff', padding: 6, borderRadius: 6 }}>
            <Text style={{ fontSize: 11 }}>
              {userLocation.latitude.toFixed(5)}, {userLocation.longitude.toFixed(5)}
            </Text>
          </View>
        </Marker>
      )}
    </MapView>
  );
}
