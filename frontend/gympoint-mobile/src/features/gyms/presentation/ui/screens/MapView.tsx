import { Platform, StyleProp, ViewStyle } from 'react-native';
import type { LatLng, MapLocation, Region } from '@features/gyms/types';
import { useMapUserLocation } from '@shared/hooks/useMapUserLocation';
import { MapFallback, MapMarker, UserLocationPin } from '@shared/components/ui';
import { MAP_STYLE } from './mapViewConfig';
import WebMapView from './MapView.web';

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
      <WebMapView
        initialRegion={initialRegion}
        locations={locations}
        style={style}
        userLocation={userLocation}
        animateToUserOnChange={animateToUserOnChange}
        zoomDelta={zoomDelta}
        showUserFallbackPin={showUserFallbackPin}
        mapHeight={mapHeight}
        debugUser={debugUser}
      />
    );
  }
  
  // Importación dinámica solo para plataformas nativas
  let NativeMapView;
  try {
    const RNMaps = require('react-native-maps');
    NativeMapView = RNMaps.default;
  } catch (error) {
    console.warn('react-native-maps no está disponible:', error);
    return null;
  }

  const {
    mapRef,
    startRegion,
    tracksViewChanges,
    handleReady,
    handleUserMarkerLayout,
  } = useMapUserLocation({
    userLocation,
    animateToUserOnChange,
    zoomDelta,
  });

  return (
    <NativeMapView
      ref={mapRef}
      initialRegion={startRegion || initialRegion}
      onMapReady={handleReady}
      onLayout={handleReady}
      style={[MAP_STYLE, { height: mapHeight }, style]}
      showsUserLocation
      showsMyLocationButton
    >
      {locations.map((location) => (
        <MapMarker key={location.id} location={location} />
      ))}

      {userLocation && (
        <UserLocationPin
          userLocation={userLocation}
          showFallbackPin={showUserFallbackPin}
          debugUser={debugUser}
          tracksViewChanges={tracksViewChanges}
          onLayout={handleUserMarkerLayout}
        />
      )}
    </NativeMapView>
  );
}
