// src/features/gyms/hooks/useGymsFiltering.ts
import { useMemo } from 'react';
import type { Gym } from '../domain/entities/Gym';
import type { Schedule } from '../domain/entities/Schedule';
import { isGymOpenNow, matchesTimeWindow } from '../utils/schedule';
import { parsePriceFilter } from '../utils/price'; // o mantené el parser inline si lo tenés así

/** Normaliza services/equipment a array lowercase */
function extractServices(g: any): string[] {
  if (Array.isArray(g?.services)) {
    return g.services.map((s: string) => (s ?? '').toString().trim().toLowerCase()).filter(Boolean);
  }
  if (Array.isArray(g?.equipment)) {
    return g.equipment.map((s: string) => (s ?? '').toString().trim().toLowerCase()).filter(Boolean);
  }
  if (typeof g?.equipment === 'string') {
    return g.equipment.split(',')
      .map((s: string) => s.trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
}

export function useGymsFiltering(
  dataFromApi: Gym[] | null | undefined,
  fallback: Gym[],
  search: string,
  services: string[] = [],
  priceFilter?: string,
  openNow?: boolean,
  timeFilter?: string,
  schedulesByGym?: Record<number, Schedule[]>
) {
  return useMemo<Gym[]>(() => {
    const base = (dataFromApi && dataFromApi.length ? dataFromApi : fallback);
    const q = (search ?? '').trim().toLowerCase();

    // 1) Texto
    const byText = q.length
      ? base.filter(g =>
          g.name.toLowerCase().includes(q) ||
          (g.address ?? '').toLowerCase().includes(q) ||
          (g.city ?? '').toLowerCase().includes(q)
        )
      : base;

    // 2) Servicios (case-insensitive; soporta string en equipment)
    const selectedLower = (services ?? []).map(s => (s ?? '').toString().trim().toLowerCase());
    const byServices = selectedLower.length
      ? byText.filter(g => {
          const svc = extractServices(g);
          return selectedLower.some(sel => svc.includes(sel));
        })
      : byText;

    // 3) Precio mensual
    const pf = parsePriceFilter(priceFilter);
    const byPrice = pf
      ? byServices.filter(g => {
          const price = Number(g.monthPrice);
          if (!Number.isFinite(price)) return false;

          if (pf.kind === 'free')  return price === 0;
          if (pf.kind === 'min')   return price >= pf.min;
          if (pf.kind === 'range') return price >= pf.min && price <= pf.max;
          return true;
        })
      : byServices;

    // 4) Horario — lógica combinada:
    //    - Si SOLO hay timeFilter (ventana): usar 'any-day'
    //    - Si hay openNow + timeFilter: openNow (today) AND ventana (today)
    //    - Si solo openNow: openNow (today)
    const needTime = !!timeFilter;
    const needOpen = !!openNow;

    const byTime = (needTime || needOpen)
      ? byPrice.filter(g => {
          const id = Number(g.id);
          const schedules = schedulesByGym?.[id] ?? [];
          if (!schedules.length) return false;

          if (needOpen && needTime) {
            // Abierto ahora HOY && ventana HOY
            return (
              isGymOpenNow(schedules, new Date()) &&
              matchesTimeWindow(schedules, timeFilter!, new Date(), 'today')
            );
          }
          if (needOpen) {
            // Solo “Abierto ahora”
            return isGymOpenNow(schedules, new Date());
          }
          if (needTime) {
            // Solo ventana: 'any-day' (como querías)
            return matchesTimeWindow(schedules, timeFilter!, new Date(), 'any-day');
          }
          return true;
        })
      : byPrice;

    // 5) Ordenar por distancia
    return [...byTime].sort((a, b) => (a.distancia ?? 1e12) - (b.distancia ?? 1e12));
  }, [dataFromApi, fallback, search, services, priceFilter, openNow, timeFilter, schedulesByGym]);
}
