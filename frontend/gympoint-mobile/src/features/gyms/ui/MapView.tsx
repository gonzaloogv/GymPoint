import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleProp, Text, View, ViewStyle } from 'react-native';

import type { LatLng, MapLocation, Region } from '@features/gyms/types';

import {
  DEBUG_BADGE_STYLE,
  MAP_STYLE,
  USER_FOCUS_DURATION,
  USER_PIN_PULSE_DURATION,
  USER_PIN_SIZE,
  USER_PIN_SOURCE,
  USER_UPDATE_DURATION,
  WEB_FALLBACK_STYLE,
  createRegion,
} from './mapViewConfig';

type Props = {
  initialRegion: Region;
  locations: MapLocation[];
  style?: StyleProp<ViewStyle>;
  userLocation?: LatLng;
  animateToUserOnChange?: boolean;
  zoomDelta?: number;
  showUserFallbackPin?: boolean;
  mapHeight?: number;
  debugUser?: boolean;
};

export default function MapView({
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
      <View style={[WEB_FALLBACK_STYLE, { height: mapHeight }, style]}>
        <Text>Mapa no disponible en Web con react-native-maps</Text>
      </View>
    );
  }

  const RNMaps = require('react-native-maps');
  const NativeMapView = RNMaps.default;
  const Marker = RNMaps.Marker || RNMaps.default.Marker;

  const mapRef = useRef<any>(null);
  const startRegion = userLocation
    ? createRegion(userLocation, zoomDelta)
    : initialRegion;

  const focusUserRegion = useCallback(
    (duration: number) => {
      if (!mapRef.current || !userLocation) return;
      mapRef.current.animateToRegion(createRegion(userLocation, zoomDelta), duration);
    },
    [userLocation, zoomDelta],
  );

  const handleReady = useCallback(() => {
    if (!animateToUserOnChange) return;
    focusUserRegion(USER_FOCUS_DURATION);
  }, [animateToUserOnChange, focusUserRegion]);

  useEffect(() => {
    if (!animateToUserOnChange || !userLocation) return;
    focusUserRegion(USER_UPDATE_DURATION);
  }, [animateToUserOnChange, userLocation, focusUserRegion]);

  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: USER_PIN_PULSE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: USER_PIN_PULSE_DURATION,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [scale]);

  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const handleUserMarkerLayout = useCallback(() => {
    requestAnimationFrame(() => setTracksViewChanges(false));
  }, []);

  return (
    <NativeMapView
      ref={mapRef}
      initialRegion={startRegion}
      onMapReady={handleReady}
      onLayout={handleReady}
      style={[MAP_STYLE, { height: mapHeight }, style]}
      showsUserLocation
      showsMyLocationButton
    >
      {locations.map(({ id, coordinate, title }) => (
        <Marker key={id} coordinate={coordinate} title={title} />
      ))}

      {userLocation && showUserFallbackPin && USER_PIN_SOURCE && (
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
            source={USER_PIN_SOURCE}
            style={{
              width: USER_PIN_SIZE,
              height: USER_PIN_SIZE,
              transform: [{ scale }],
            }}
            resizeMode="contain"
          />
        </Marker>
      )}

      {debugUser && userLocation && (
        <Marker coordinate={userLocation}>
          <View style={DEBUG_BADGE_STYLE}>
            <Text style={{ fontSize: 11 }}>
              {userLocation.latitude.toFixed(5)}, {userLocation.longitude.toFixed(5)}
            </Text>
          </View>
        </Marker>
      )}
    </NativeMapView>
  );
}
