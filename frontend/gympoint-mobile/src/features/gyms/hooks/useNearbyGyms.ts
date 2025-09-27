// src/features/gyms/hooks/useNearbyGyms.ts
import { useEffect, useState } from 'react';
import { GymsService, Gym } from '../services/gyms.service';

const MOCK: Gym[] = [
  { id: '1', name: 'BULLDOG CENTER',     lat: -27.4546453, lng: -58.9913384, address: '—', distancia: 0 },
  { id: '2', name: 'EQUILIBRIO FITNESS', lat: -27.4484469, lng: -58.9937996, address: '—', distancia: 0 },
  { id: '3', name: 'EXEN GYM',           lat: -27.4560971, lng: -58.9867207, address: '—', distancia: 0 },
  { id: '4', name: 'GreyFit',            lat: -27.4495771, lng: -58.982319,  address: '—', distancia: 0 },
  { id: '5', name: 'Smart Fit',          lat: -34.615,     lng: -58.380,     address: '—', distancia: 0 },
];

export function useNearbyGyms(lat?: number, lng?: number, radius = 10000) {
  const [data, setData] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    // Si aún no hay ubicación, dejamos vacío (no llamamos)
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      setData([]);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const gyms = await GymsService.listNearby({ lat, lng, radius });
        if (!mounted) return;

        if (Array.isArray(gyms) && gyms.length > 0) {
          setData(gyms);
        } else {
          // Fallback a mock si backend responde vacío
          setData(MOCK);
        }
      } catch (e) {
        if (!mounted) return;
        console.log('[useNearbyGyms] error:', e);
        setError(e);
        // Fallback a mock si ocurre error de red
        setData(MOCK);
      } finally {
        mounted && setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [lat, lng, radius]);

  return { data, loading, error };
}
