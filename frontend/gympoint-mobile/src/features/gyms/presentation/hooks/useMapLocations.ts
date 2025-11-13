import { useMemo } from 'react';

import type { Gym } from '@features/gyms/domain/entities/Gym';
import type { MapLocation } from '../types';

export function useMapLocations(gyms: Gym[]) {
  return useMemo<MapLocation[]>(
    () => {
      const locations = gyms.map((g) => {
        const mapLocation = {
          id: String(g.id),
          title: g.name,
          coordinate: { latitude: g.lat, longitude: g.lng },
        };

        // Debug logging for coordinate conversion
        if (!Number.isFinite(g.lat) || !Number.isFinite(g.lng)) {
          console.warn('[useMapLocations] ⚠️ Invalid coordinates for gym:', {
            gymId: g.id,
            gymName: g.name,
            lat: g.lat,
            lng: g.lng,
            latIsFinite: Number.isFinite(g.lat),
            lngIsFinite: Number.isFinite(g.lng),
          });
        }

        return mapLocation;
      });

      if (gyms.length > 0) {
        console.log('[useMapLocations] ✅ Converted gyms to map locations:', {
          count: locations.length,
          samples: locations.slice(0, 3).map(l => ({
            id: l.id,
            title: l.title,
            lat: l.coordinate.latitude,
            lng: l.coordinate.longitude,
          })),
        });
      }

      return locations;
    },
    [gyms],
  );
}
