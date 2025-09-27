import { useMemo } from 'react';

export function useActiveFiltersCount(services: string[], price: string, time: string) {
  return useMemo(() => services.length + (price ? 1 : 0) + (time ? 1 : 0), [services, price, time]);
}
