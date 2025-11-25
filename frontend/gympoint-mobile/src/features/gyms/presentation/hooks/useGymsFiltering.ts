// src/features/gyms/hooks/useGymsFiltering.ts
import { useMemo } from 'react';
import type { Gym } from '@features/gyms/domain/entities/Gym';
import { Schedule } from '@features/gyms/domain/entities/Schedule';
import { isGymOpenNow, matchesTimeWindow } from '../utils/schedule';
import { parsePriceFilter } from '../utils/price'; // o mantené el parser inline si lo tenés así

/** Normaliza services/equipment a array lowercase */
function extractServices(g: any): string[] {
  if (Array.isArray(g?.services)) {
    return g.services
      .map((s: string) => (s ?? '').toString().trim().toLowerCase())
      .filter(Boolean);
  }
  if (Array.isArray(g?.equipment)) {
    return g.equipment
      .map((s: string) => (s ?? '').toString().trim().toLowerCase())
      .filter(Boolean);
  }
  if (typeof g?.equipment === 'string') {
    return g.equipment
      .split(',')
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
  amenities: string[] = [],
  features: string[] = [],
  priceFilter?: string,
  ratingFilter?: string,
  openNow?: boolean,
  timeFilter?: string,
  schedulesByGym?: Record<number, Schedule[]>,
  ratingsByGym?: Record<number, { averageRating: number; totalReviews: number }>,
) {
  return useMemo<Gym[]>(() => {
    const base = dataFromApi && dataFromApi.length ? dataFromApi : fallback;
    const q = (search ?? '').trim().toLowerCase();

    // 1) Texto
    const byText = q.length
      ? base.filter(
          (g) =>
            g.name.toLowerCase().includes(q) ||
            (g.address ?? '').toLowerCase().includes(q) ||
            (g.city ?? '').toLowerCase().includes(q),
        )
      : base;

    // 2) Servicios (case-insensitive; soporta string en equipment)
    const selectedLower = (services ?? []).map((s) =>
      (s ?? '').toString().trim().toLowerCase(),
    );
    const byServices = selectedLower.length
      ? byText.filter((g) => {
          const svc = extractServices(g);
          return selectedLower.some((sel) => svc.includes(sel));
        })
      : byText;

    // 3) Precio mensual
    const pf = parsePriceFilter(priceFilter);
    const byPrice = pf
      ? byServices.filter((g) => {
          const price = Number(g.monthPrice);
          if (!Number.isFinite(price)) return false;

          if (pf.kind === 'free') return price === 0;
          if (pf.kind === 'min') return price >= pf.min;
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

    const byTime =
      needTime || needOpen
        ? byPrice.filter((g) => {
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

    // 5) Amenidades
    const selectedAmenitiesLower = Array.isArray(amenities)
      ? amenities.map((a) => (a ?? '').toString().trim().toLowerCase())
      : [];
    const byAmenities = selectedAmenitiesLower.length
      ? byTime.filter((g) => {
          const gymAmenities = Array.isArray(g.amenities)
            ? g.amenities.map((a) => (a.name ?? '').toString().trim().toLowerCase())
            : [];
          return selectedAmenitiesLower.some((sel) => gymAmenities.includes(sel));
        })
      : byTime;

    // 6) Calificación (rating)
    const byRating = ratingFilter
      ? byAmenities.filter((g) => {
          const id = Number(g.id);
          const ratingData = ratingsByGym?.[id];
          if (!ratingData || ratingData.totalReviews === 0) {
            // Si no hay reviews, solo pasa si el filtro es "Cualquiera"
            return ratingFilter === 'Cualquiera';
          }
          const avgRating = ratingData.averageRating;
          if (ratingFilter === '4+ estrellas') return avgRating >= 4;
          if (ratingFilter === '3+ estrellas') return avgRating >= 3;
          if (ratingFilter === '2+ estrellas') return avgRating >= 2;
          return true; // "Cualquiera"
        })
      : byAmenities;

    // 7) Características especiales
    const byFeatures = features.length
      ? byRating.filter((g) => {
          return features.every((feat) => {
            if (feat === 'Auto check-in') return g.auto_checkin_enabled === true;
            if (feat === 'Pase de día gratis') return Number(g.weekPrice) === 0;
            if (feat === 'Verificado') return g.verified === true;
            if (feat === 'Destacado') return g.featured === true;
            return true;
          });
        })
      : byRating;

    // 8) Ordenar por distancia
    return [...byFeatures].sort((a, b) => (a.distancia ?? 1e12) - (b.distancia ?? 1e12));
  }, [
    dataFromApi,
    fallback,
    search,
    services,
    amenities,
    features,
    priceFilter,
    ratingFilter,
    openNow,
    timeFilter,
    schedulesByGym,
    ratingsByGym,
  ]);
}
