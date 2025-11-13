// src/features/gyms/hooks/useNearbyGyms.ts
import { useEffect, useState } from 'react';
import type { Gym } from '../../domain/entities/Gym';
import { DI } from '@di/container';
import { useGymsStore } from '../state/gyms.store';

export function useNearbyGyms(lat?: number, lng?: number, radius = 10000) {
  const [data, setData] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [hasRequested, setHasRequested] = useState(false);

  // Escuchar trigger de recarga desde WebSocket
  const refreshTrigger = useGymsStore((state) => state.refreshTrigger);

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
        console.log('[useNearbyGyms] 🔄 Fetching gyms from backend...');
        const result = await DI.listNearbyGyms.execute({ lat, lng, radius });
        if (mounted) {
          console.log('[useNearbyGyms] ✅ Gyms loaded:', result.length);
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          console.error('[useNearbyGyms] ❌ Error loading gyms:', err);
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
  }, [lat, lng, radius, refreshTrigger]); // ⬅️ Agregar refreshTrigger como dependencia

  return { data, loading, error, hasRequested };
}

