// src/features/gyms/data/GymRepositoryImpl.ts
import { GymRepository, ListNearbyParams } from '../domain/repositories/GymRepository';
import { Gym } from '../domain/entities/Gym';
import { GymDTO } from './dto/GymDTO';
import { mapGymDTOtoEntity } from './mappers/gym.mappers';
import { api } from 'services/api';

function distanceMeters(a: {lat: number; lng: number}, b: {lat: number; lng: number}) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export class GymRepositoryImpl implements GymRepository {
  async listNearby({ lat, lng, radius = 10000 }: ListNearbyParams): Promise<Gym[]> {
    try {
      // Si existe /cercanos:
      const res = await api.get('/api/gyms/cercanos', {
        params: { lat, lon: lng, radius },
      });
      const list: GymDTO[] = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      return list
        .map(mapGymDTOtoEntity)
        .filter((g): g is Gym => !!g)
        .sort((a, b) => (a.distancia ?? Infinity) - (b.distancia ?? Infinity));
    } catch {
      // Fallback: /api/gyms
      const res = await api.get('/api/gyms');
      const list: GymDTO[] = Array.isArray(res.data) ? res.data : [];
      return list
        .map(mapGymDTOtoEntity)
        .filter((g): g is Gym => !!g)
        .map(g => ({
          ...g,
          distancia: distanceMeters({ lat, lng }, { lat: g.lat, lng: g.lng }),
        }))
        .filter(g => (g.distancia ?? Infinity) <= radius)
        .sort((a, b) => (a.distancia ?? Infinity) - (b.distancia ?? Infinity));
    }
  }

  async listAll(): Promise<Gym[]> {
    const res = await api.get('/api/gyms');
    const list: GymDTO[] = Array.isArray(res.data) ? res.data : [];
    return list.map(mapGymDTOtoEntity).filter((g): g is Gym => !!g);
  }

  async getById(id: string): Promise<Gym | null> {
    const res = await api.get(`/api/gyms/${id}`);
    return mapGymDTOtoEntity(res.data) ?? null;
  }
}
