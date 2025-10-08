// src/features/gyms/hooks/useActiveFiltersCount.ts
import { useMemo } from 'react';

export function useActiveFiltersCount(
  services: string[],
  price: string,
  time: string,
  openNow: boolean,
) {
  return useMemo(
    () => services.length + (price ? 1 : 0) + (time ? 1 : 0) + (openNow ? 1 : 0),
    [services, price, time, openNow],
  );
}
