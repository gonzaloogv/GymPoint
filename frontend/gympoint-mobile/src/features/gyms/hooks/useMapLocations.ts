import { useMemo } from 'react';
import type { Gym } from '../domain/entities/Gym';

export function useMapLocations(gyms: Gym[]) {
  return useMemo(
    () =>
      gyms.map((g) => ({
        id: String(g.id),
        title: g.name,
        coordinate: { latitude: g.lat, longitude: g.lng },
      })),
    [gyms],
  );
}
