// src/features/gyms/hooks/useNearbyGyms.ts
import { useEffect, useState } from 'react';
import type { Gym } from '../domain/entities/Gym';
import { DI } from '@di/container';

export function useNearbyGyms(lat?: number, lng?: number, radius = 10000) {
  const [data, setData] = useState<Gym[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    let mounted = true;
    setLoading(true);

    DI.listNearbyGyms.execute({ lat, lng, radius })
      .then(d => { if (mounted) setData(d); })
      .catch(e => { if (mounted) setError(e); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [lat, lng, radius]);

  return { data, loading, error };
}
