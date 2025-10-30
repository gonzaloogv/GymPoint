// src/features/gyms/data/GymRepositoryImpl.ts
import { api } from '@shared/http/apiClient';

import { Gym } from '../domain/entities/Gym';
import { GymRepository, ListNearbyParams } from '../domain/repositories/GymRepository';
import { GymDTO } from './dto/GymDTO';
import { mapGymDTOtoEntity } from './mappers/gym.mappers';
import { MOCK_UI } from '../data/datasources/GymMocks';

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 * Usa el radio WGS84 (6378137 m) - mismo que Mapbox y GPS
 */
function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6378137; // WGS84 - usado por Mapbox y GPS
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export class GymRepositoryImpl implements GymRepository {
  async listNearby({ lat, lng, radius = 10000 }: ListNearbyParams): Promise<Gym[]> {
    try {
      // Obtener todos los gimnasios
      const res = await api.get('/api/gyms');

      // Extraer la lista de gimnasios (manejar respuesta paginada)
      const list: GymDTO[] = Array.isArray(res.data)
        ? res.data
        : (res.data?.items ?? res.data?.data ?? []);

      if (list.length > 0) {
        
        // Calcular distancia en el cliente y filtrar por radio
        return list
          .map(mapGymDTOtoEntity)
          .filter((g): g is Gym => !!g)
          .map((g) => ({
            ...g,
            distancia: distanceMeters({ lat, lng }, { lat: g.lat, lng: g.lng }),
          }))
          .filter((g) => (g.distancia ?? Infinity) <= radius)
          .sort((a, b) => (a.distancia ?? Infinity) - (b.distancia ?? Infinity));
      }

      throw new Error('No hay datos en /api/gyms');
    } catch (apiError) {
      // Fallback final: usar mocks
      return MOCK_UI.map((mockGym) => ({
        ...mockGym,
        distancia: distanceMeters({ lat, lng }, { lat: mockGym.lat, lng: mockGym.lng }),
      }))
        .filter((g) => (g.distancia ?? Infinity) <= radius)
        .sort((a, b) => (a.distancia ?? Infinity) - (b.distancia ?? Infinity));
    }
  }

  async listAll(): Promise<Gym[]> {
    try {
      const res = await api.get('/api/gyms');

      // Extraer la lista de gimnasios (manejar respuesta paginada)
      const list: GymDTO[] = Array.isArray(res.data)
        ? res.data
        : (res.data?.items ?? res.data?.data ?? []);

      if (list.length > 0) {
        return list.map(mapGymDTOtoEntity).filter((g): g is Gym => !!g);
      }

      throw new Error('No hay datos en la API');
    } catch (apiError) {
      return MOCK_UI;
    }
  }

  async getById(id: string): Promise<Gym | null> {
    try {
      const res = await api.get(`/api/gyms/${id}`);
      const gym = mapGymDTOtoEntity(res.data);

      if (gym) {
        return gym;
      }

      throw new Error('Gimnasio no encontrado en API');
    } catch (apiError) {
      const mockGym = MOCK_UI.find((g) => g.id === id);

      if (mockGym) {
        return mockGym;
      }

      return null;
    }
  }
}
