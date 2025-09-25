import { useEffect, useState } from 'react';
import { GymsService, Gym } from '../services/gyms.service'; // 👈 OJO: gyms.service (plural)

export function useNearbyGyms(lat?: number, lng?: number, radius = 2000) {
  const [data, setData] = useState<Gym[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return;

    let mounted = true;
    setLoading(true);
    console.log('[Gyms] fetching /cercanos', { lat, lng, radius });

    GymsService.listNearby({ lat, lng, radius })
      .then((d: Gym[]) => {
        if (!mounted) return;
        console.log('[Gyms] result length:', d?.length ?? 0);
        setData(d);
      })
      .catch((e: unknown) => {
        if (!mounted) return;
        console.log('[Gyms] error:', e);
        setError(e);
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [lat, lng, radius]);

  return { data, loading, error };
}
