import { useState, useEffect } from 'react';
import { DI } from '@di/container';
import { Gym } from '../../domain/entities/Gym';
import { Schedule } from '../../domain/entities/Schedule';
import { GymRemote } from '../../data/gym.remote';

interface UseGymDetailResult {
  gym: Gym | null;
  schedules: Schedule[];
  loading: boolean;
  error: unknown;
  averageRating: number | null;
  totalReviews: number;
}

/**
 * Hook para obtener los detalles completos de un gimnasio
 * Incluye información del gimnasio y sus horarios
 */
export function useGymDetail(gymId: string | number): UseGymDetailResult {
  const [gym, setGym] = useState<Gym | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState<number>(0);

  useEffect(() => {
    if (!gymId) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    const numericId = Number(gymId);

    if (!Number.isFinite(numericId)) {
      setError(new Error('Invalid gym ID'));
      setLoading(false);
      return;
    }

    // Fetch gym details, schedules, and reviews stats in parallel
    Promise.all([
      GymRemote.getById(numericId)
        .then((gymData: any) => {
          // Map API response to Gym entity
          // Response structure: GymResponse (flat object with id_gym, latitude, longitude, equipment, services, rules, amenities)
          return {
            id: gymData.id_gym,
            name: gymData.name,
            description: gymData.description,
            address: gymData.address,
            city: gymData.city,
            lat: gymData.latitude,
            lng: gymData.longitude,
            monthPrice: gymData.month_price,
            weekPrice: gymData.week_price,
            equipment: gymData.equipment || {}, // Objeto categorizado
            services: gymData.services || [], // Array de servicios/tipos
            rules: gymData.rules || [],
            amenities: gymData.amenities || [],
            phone: gymData.phone,
            email: gymData.email,
            website: gymData.website,
            google_maps_url: gymData.google_maps_url,
            geofence_radius_meters: gymData.geofence_radius_meters,
            min_stay_minutes: gymData.min_stay_minutes,
            auto_checkin_enabled: gymData.auto_checkin_enabled,
            verified: gymData.verified,
            featured: gymData.featured,
            is_active: gymData.is_active,
          } as Gym;
        }),
      DI.getSchedulesForGyms.execute([numericId])
        .then((map: Record<number, Schedule[]>) => map[numericId] || []),
      // Fetch reviews to calculate stats
      GymRemote.listReviews(numericId, { page: 1, limit: 100 })
        .then((data: any) => {
          const items = data.items || [];
          const total = data.totalItems || 0;
          const average = items.length > 0
            ? items.reduce((sum: number, item: any) => sum + (item.rating || 0), 0) / items.length
            : null;
          return { total, average };
        })
        .catch(() => ({ total: 0, average: null })),
    ])
      .then(([gymData, schedulesData, reviewsData]) => {
        if (mounted) {
          setGym(gymData);
          setSchedules(schedulesData);
          setTotalReviews(reviewsData.total);
          setAverageRating(reviewsData.average);
        }
      })
      .catch((e) => {
        if (mounted) {
          console.error('[useGymDetail] Error fetching gym details:', e);
          setError(e);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [gymId]);

  return { gym, schedules, loading, error, averageRating, totalReviews };
}
