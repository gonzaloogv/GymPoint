import React from 'react';
import { Animated, View, Text, Platform } from 'react-native';
import type { LatLng } from '@features/gyms/presentation/types';
import { useMapAnimations } from '@features/gyms/presentation/hooks';

// Importar Marker de forma estática (solo en plataformas nativas)
let Marker: any = null;
if (Platform.OS !== 'web') {
  try {
    const MapView = require('react-native-maps');
    Marker = MapView.Marker;
    if (!Marker) {
      console.warn('[UserLocationPin] ⚠️ Marker no está disponible en react-native-maps');
    }
  } catch (error) {
    console.warn('[UserLocationPin] ⚠️ Error importando react-native-maps:', error);
  }
}

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

  // Validar que las coordenadas del usuario sean válidas
  const isValidLocation = userLocation &&
    typeof userLocation.latitude === 'number' &&
    typeof userLocation.longitude === 'number' &&
    isFinite(userLocation.latitude) &&
    isFinite(userLocation.longitude);

  if (!isValidLocation) {
    console.warn('[UserLocationPin] ⚠️ Ubicación del usuario inválida:', {
      userLocation,
      latType: typeof userLocation?.latitude,
      lngType: typeof userLocation?.longitude,
      latIsFinite: Number.isFinite(userLocation?.latitude),
      lngIsFinite: Number.isFinite(userLocation?.longitude),
    });
    return null;
  }

  // Debug: Log valid user location being rendered
  console.log('[UserLocationPin] ✅ Rendering user location pin:', {
    lat: userLocation.latitude,
    lng: userLocation.longitude,
  });

  // Verificar que Marker está disponible (importado en el scope global)
  if (!Marker) {
    console.warn('[UserLocationPin] ⚠️ Marker component not available');
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
