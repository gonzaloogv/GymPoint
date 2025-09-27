import { useMemo } from 'react';
import { DEFAULT_REGION } from '../constants';

export function useMapInitialRegion(lat?: number, lng?: number) {
  return useMemo(() => {
    if (lat && lng) {
      return { latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 };
    }
    return DEFAULT_REGION;
  }, [lat, lng]);
}
