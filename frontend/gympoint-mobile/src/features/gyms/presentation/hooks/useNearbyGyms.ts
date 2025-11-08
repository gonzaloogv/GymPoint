// src/features/gyms/hooks/useNearbyGyms.ts
import { useEffect, useState } from 'react';
import type { Gym } from '../../domain/entities/Gym';
import { DI } from '@di/container';

export function useNearbyGyms(lat?: number, lng?: number, radius = 10000) {
  const [data, setData] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchGyms = async () => {
      setLoading(true);
      try {
        // Si todavía no contamos con coordenadas, retornamos sin solicitar datos.
        if (typeof lat !== 'number' || typeof lng !== 'number') {
          setData([]);
          setHasRequested(false);
          return;
        }

        setHasRequested(true);
        const result = await DI.listNearbyGyms.execute({ lat, lng, radius });
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          setData([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchGyms();

    return () => {
      mounted = false;
    };
  }, [lat, lng, radius]);

  return { data, loading, error, hasRequested };
}

