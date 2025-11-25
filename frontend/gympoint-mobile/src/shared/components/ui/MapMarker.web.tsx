import React from 'react';
import type { MapLocation } from '@features/gyms/presentation/types';

type Props = {
  location: MapLocation;
};

export function MapMarker({ location }: Props) {
  // En web, no renderizamos nada ya que no hay mapa
  return null;
}
