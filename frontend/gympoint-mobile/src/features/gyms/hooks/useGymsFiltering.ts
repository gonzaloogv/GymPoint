// useGymsFiltering.ts
import { useMemo } from 'react';
import type { Gym } from '../types';

// --- helper robusto para interpretar el chip seleccionado ---
function parsePriceFilter(label?: string): 
  | { kind: 'free' }
  | { kind: 'range'; min: number; max: number }
  | { kind: 'min'; min: number }
  | null {
  if (!label) return null;

  const clean = label.trim();

  // Gratis
  if (/gratis/i.test(clean)) return { kind: 'free' };

  // "5000+" (mínimo)
  const plus = clean.match(/\$?\s*([\d.]+)\s*\+$/);
  if (plus) {
    const min = Number(plus[1].replace(/\./g, ''));
    return Number.isFinite(min) ? { kind: 'min', min } : null;
  }

  // "$13000-20000" — permitimos guion normal o en-dash
  const range = clean.match(/\$?\s*([\d.]+)\s*[-–—]\s*\$?\s*([\d.]+)/);
  if (range) {
    const min = Number(range[1].replace(/\./g, ''));
    const max = Number(range[2].replace(/\./g, ''));
    if (Number.isFinite(min) && Number.isFinite(max) && min <= max) {
      return { kind: 'range', min, max };
    }
    return null;
  }

  return null;
}

export function useGymsFiltering(
  dataFromApi: Gym[] | null | undefined,
  fallback: Gym[],
  search: string,
  services: string[] = [],
  priceFilter?: string,
  timeFilter?: string
) {
  return useMemo<Gym[]>(() => {
    const base = (dataFromApi && dataFromApi.length ? dataFromApi : fallback);
    const q = (search ?? '').trim().toLowerCase();

    // texto: name / address / city
    const byText = q.length
      ? base.filter(g =>
          g.name.toLowerCase().includes(q) ||
          (g.address ?? '').toLowerCase().includes(q) ||
          (g.city ?? '').toLowerCase().includes(q)
        )
      : base;

    // servicios (si tu API trae equipment como array; si viene string "Pesas, cardio", ajustá esto)
    const byServices = services.length
      ? byText.filter(g =>
          Array.isArray((g as any).services)
            ? (g as any).services.some((s: string) => services.includes(s))
            : Array.isArray(g.equipment)
              ? g.equipment.some((s: string) => services.includes(s))
              : false
        )
      : byText;

    // precio mensual (monthPrice) — con parser robusto
    const pf = parsePriceFilter(priceFilter);
    const byPrice = pf
      ? byServices.filter(g => {
          const price = Number(g.monthPrice);
          if (!Number.isFinite(price)) return false;

          if (pf.kind === 'free') return price === 0;
          if (pf.kind === 'min')  return price >= pf.min;
          if (pf.kind === 'range') return price >= pf.min && price <= pf.max;

          return true;
        })
      : byServices;

    // horario — pendiente de tus campos reales
    const byTime = timeFilter ? byPrice /* .filter(...) */ : byPrice;

    // ordenar por distancia si existe
    return [...byTime].sort((a, b) => (a.distancia ?? 1e12) - (b.distancia ?? 1e12));
  }, [dataFromApi, fallback, search, services, priceFilter, timeFilter]);
}
