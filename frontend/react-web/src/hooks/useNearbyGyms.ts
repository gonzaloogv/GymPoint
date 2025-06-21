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

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async pos => {
      const coords = [pos.coords.latitude, pos.coords.longitude] as [number, number];
      setPosition(coords);
      const gymsNearby = await fetchNearbyGyms(coords[0], coords[1]);
      setGyms(gymsNearby);
      setLoading(false);
    });
  }, []);

  return { position, gyms, loading };
}
