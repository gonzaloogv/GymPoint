import { useMemo } from 'react';

import type { Gym } from '../domain/entities/Gym';
import type { MapLocation } from '../types';

export function useMapLocations(gyms: Gym[]) {
  return useMemo<MapLocation[]>(
    () =>
      gyms.map((g) => ({
        id: String(g.id),
        title: g.name,
        coordinate: { latitude: g.lat, longitude: g.lng },
      })),
    [gyms],
  );
}
