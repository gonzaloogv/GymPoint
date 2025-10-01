import { Platform, StyleProp, ViewStyle } from 'react-native';
import type { LatLng, MapLocation, Region } from '@features/gyms/types';
import { useMapUserLocation } from '@shared/hooks/useMapUserLocation';
import { MapFallback, MapMarker, UserLocationPin } from '@shared/components/ui';
import { MAP_STYLE } from './mapViewConfig';

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
    return <MapFallback mapHeight={mapHeight} style={style} />;
  }

  const RNMaps = require('react-native-maps');
  const NativeMapView = RNMaps.default;

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
