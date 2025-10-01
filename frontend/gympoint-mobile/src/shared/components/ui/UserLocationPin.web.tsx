import React from 'react';
import type { LatLng } from '@features/gyms/types';

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
  // En web, no renderizamos nada ya que no hay mapa
  return null;
}
