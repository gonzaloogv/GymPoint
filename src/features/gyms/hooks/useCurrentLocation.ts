import { useEffect, useState, useCallback } from 'react';
import * as Location from 'expo-location';

export type LocationStatus = 'granted' | 'denied' | 'prompt';

type Coords = { latitude: number; longitude: number };

export function useCurrentLocation() {
  const [status, setStatus] = useState<LocationStatus>('prompt');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // Solo chequea permiso sin solicitarlo (no dispara modal)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await Location.getForegroundPermissionsAsync();
        if (!mounted) return;
        setStatus(p.status as LocationStatus);
        if (p.status === 'granted') {
          setLoading(true);
          const cur = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (!mounted) return;
          setCoords({ latitude: cur.coords.latitude, longitude: cur.coords.longitude });
        }
      } catch (e) {
        if (!mounted) return;
        setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Permite pedir permiso y tomar ubicación actual
  const request = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await Location.requestForegroundPermissionsAsync();
      setStatus(r.status as LocationStatus);
      if (r.status === 'granted') {
        const cur = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCoords({ latitude: cur.coords.latitude, longitude: cur.coords.longitude });
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  return { status, coords, loading, error, request };
}
