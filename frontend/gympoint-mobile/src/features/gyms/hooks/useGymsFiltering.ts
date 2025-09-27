// src/features/gyms/hooks/useGymsFiltering.ts
import React from 'react';
import type { Gym } from '../services/gyms.service';

export function useGymsFiltering(data: Gym[] | null, mock: Gym[], searchText: string, selectedServices: string[]) {
  return React.useMemo(() => {
    const base = (data && data.length ? data : mock);
    const q = (searchText ?? '').trim().toLowerCase();

    const byText = q.length
      ? base.filter(g =>
          g.name.toLowerCase().includes(q) ||
          (g.address ?? '').toLowerCase().includes(q)
        )
      : base;

    const byServices = selectedServices.length
      ? byText.filter((g: any) => Array.isArray(g.services) && g.services.some((s: string) => selectedServices.includes(s)))
      : byText;

    return [...byServices].sort((a, b) => (a.distancia ?? 1e12) - (b.distancia ?? 1e12));
  }, [data, mock, searchText, selectedServices]);
}
