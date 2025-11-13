import { useMemo } from 'react';
import { DEFAULT_REGION } from '@features/gyms/domain/constants/map';

export function useMapInitialRegion(lat?: number, lng?: number) {
  return useMemo(() => {
    if (lat && lng) {
      const region = { latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 };
      console.log('[useMapInitialRegion] ✅ Using user location:', {
        lat,
        lng,
        region,
      });
      return region;
    }

    console.log('[useMapInitialRegion] 📍 Using DEFAULT_REGION (no user location):', {
      lat,
      lng,
      region: DEFAULT_REGION,
    });
    return DEFAULT_REGION;
  }, [lat, lng]);
}
