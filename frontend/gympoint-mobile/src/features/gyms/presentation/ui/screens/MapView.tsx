import { Platform, StyleProp, ViewStyle } from 'react-native';
import type { LatLng, MapLocation, Region } from '@features/gyms/presentation/types';
import { useMapUserLocation, useMapZoom } from '@features/gyms/presentation/hooks';
import { MapFallback, MapMarker, UserLocationPin, ClusterMarker } from '@shared/components/ui';
import { MAP_STYLE } from './mapViewConfig';
import WebMapView from './MapView.web';
import React from 'react';

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
  let ClusteredMapView;
  let Marker;
  try {
    const MapClustering = require('react-native-map-clustering');
    const RNMaps = require('react-native-maps');
    ClusteredMapView = MapClustering.default;
    Marker = RNMaps.Marker || RNMaps.default.Marker;
  } catch (error) {
    console.warn('react-native-maps no está disponible:', error);
    return null;
  }

  const { mapRef, startRegion, tracksViewChanges, handleReady, handleUserMarkerLayout } =
    useMapUserLocation({
      userLocation,
      animateToUserOnChange,
      zoomDelta,
    });

  // Hook para gestionar zoom adaptativo
  const { zoomState, handleRegionChange } = useMapZoom();

  return (
    <ClusteredMapView
      ref={mapRef}
      initialRegion={startRegion || initialRegion}
      onMapReady={handleReady}
      onLayout={handleReady}
      onRegionChangeComplete={handleRegionChange}
      style={[MAP_STYLE, { height: mapHeight }, style]}
      showsUserLocation
      showsMyLocationButton
      radius={60}
      maxZoom={20}
      minZoom={1}
      extent={512}
      nodeSize={64}
      clusterColor="#43adff"
      clusterTextColor="#ffffff"
      renderCluster={(cluster) => {
        const { coordinate, pointCount } = cluster;
        return (
          <Marker key={`cluster-${coordinate.latitude}-${coordinate.longitude}`} coordinate={coordinate}>
            <ClusterMarker count={pointCount} />
          </Marker>
        );
      }}
    >
      {locations.map((location) => (
        <MapMarker
          key={location.id}
          location={location}
          pinSize={zoomState.pinSize}
          scale={zoomState.scale}
        />
      ))}

      {userLocation && (
        <UserLocationPin
          userLocation={userLocation}
          showFallbackPin={showUserFallbackPin}
          tracksViewChanges={tracksViewChanges}
          onLayout={handleUserMarkerLayout}
        />
      )}
    </ClusteredMapView>
  );
}
