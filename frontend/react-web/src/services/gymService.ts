import axios from 'axios';
import type { Gym } from '../hooks/useNearbyGyms';

const API_BASE = (import.meta.env.VITE_API_URL || '/').replace(/\/$/, '');

export async function fetchNearbyGyms(lat: number, lon: number): Promise<Gym[]> {
  try {
    const res = await axios.get(
      `${API_BASE}/api/gyms/cercanos?lat=${lat}&lon=${lon}`
    );
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.gyms)) return data.gyms;
    return [];
  } catch {
    return [];
  }
}