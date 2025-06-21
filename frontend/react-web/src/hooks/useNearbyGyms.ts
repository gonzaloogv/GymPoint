import { useEffect, useState } from 'react';
import { fetchNearbyGyms } from '../services/gymService';

export interface Gym {
  id_gym: number;
  name: string;
  latitude: number;
  longitude: number;
}

export function useNearbyGyms() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const watcherId = navigator.geolocation.watchPosition(
      async pos => {
        try {
          const coords = [pos.coords.latitude, pos.coords.longitude] as [number, number];
          setPosition(coords);
          const gymsNearby = await fetchNearbyGyms(coords[0], coords[1]);
          setGyms(gymsNearby);
          setError(null); // todo salió bien
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Error desconocido al obtener gimnasios cercanos');
          }
        } finally {
          setLoading(false);
        }
      },
      geoErr => {
        setError(geoErr.message || 'Error de geolocalización');
        setLoading(false);
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watcherId);
    };
  }, []);

  return {
    position,
    gyms,
    loading,
    error, // 👈 devolvés el error para poder usarlo en el componente
  };
}
