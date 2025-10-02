import React from 'react';
import { Platform } from 'react-native';
import type { MapLocation } from '@features/gyms/types';

type Props = {
  location: MapLocation;
};

export function MapMarker({ location }: Props) {
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
    <Marker 
      key={location.id} 
      coordinate={location.coordinate} 
      title={location.title} 
    />
  );
}
