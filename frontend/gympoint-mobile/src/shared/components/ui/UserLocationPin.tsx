import React from 'react';
import { Animated, View, Text, Platform } from 'react-native';
import type { LatLng } from '@features/gyms/types';
import { useMapAnimations } from '@shared/hooks/useMapAnimations';

const USER_PIN_SIZE = 30;
const DEBUG_BADGE_STYLE = {
  backgroundColor: '#fff',
  padding: 6,
  borderRadius: 6,
};

const USER_PIN_SOURCE = (() => {
  try {
    return require('../../../../assets/ubication.png');
  } catch {
    return undefined;
  }
})();

type Props = {
  userLocation: LatLng;
  showFallbackPin?: boolean;
  debugUser?: boolean;
  tracksViewChanges: boolean;
  onLayout: () => void;
};

export function UserLocationPin({
  userLocation,
  showFallbackPin = true,
  debugUser = false,
  tracksViewChanges,
  onLayout,
}: Props) {
  const { scale } = useMapAnimations();

  if (Platform.OS === 'web') {
    return null;
  }

  // Importación dinámica solo para plataformas nativas
  let Marker;
  try {
    const RNMaps = require('react-native-maps');
    Marker = RNMaps.Marker || RNMaps.default.Marker;
  } catch (error) {
    console.warn('react-native-maps no está disponible:', error);
    return null;
  }

  return (
    <>
      {showFallbackPin && USER_PIN_SOURCE && (
        <Marker
          coordinate={userLocation}
          title="Tu ubicación"
          anchor={{ x: 0.5, y: 0.5 }}
          flat
          zIndex={9999}
          tracksViewChanges={tracksViewChanges}
          onLayout={onLayout}
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

      {debugUser && (
        <Marker coordinate={userLocation}>
          <View style={DEBUG_BADGE_STYLE}>
            <Text style={{ fontSize: 11 }}>
              {userLocation.latitude.toFixed(5)}, {userLocation.longitude.toFixed(5)}
            </Text>
          </View>
        </Marker>
      )}
    </>
  );
}
