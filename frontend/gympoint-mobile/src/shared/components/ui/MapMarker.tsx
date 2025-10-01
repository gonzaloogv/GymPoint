import React from 'react';
import type { MapLocation } from '@features/gyms/types';

type Props = {
  location: MapLocation;
};

export function MapMarker({ location }: Props) {
  const RNMaps = require('react-native-maps');
  const Marker = RNMaps.Marker || RNMaps.default.Marker;

  return (
    <Marker 
      key={location.id} 
      coordinate={location.coordinate} 
      title={location.title} 
    />
  );
}
