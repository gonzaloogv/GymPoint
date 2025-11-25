// src/features/gyms/hooks/useActiveFiltersCount.ts
import { useMemo } from 'react';

export function useActiveFiltersCount(
  services: string[],
  amenities: string[],
  features: string[],
  price: string,
  rating: string,
  time: string,
  openNow: boolean,
) {
  return useMemo(
    () =>
      services.length +
      amenities.length +
      features.length +
      (price ? 1 : 0) +
      (rating ? 1 : 0) +
      (time ? 1 : 0) +
      (openNow ? 1 : 0),
    [services, amenities, features, price, rating, time, openNow],
  );
}
