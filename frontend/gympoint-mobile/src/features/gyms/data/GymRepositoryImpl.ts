// src/features/gyms/data/GymRepositoryImpl.ts
import { api } from '@shared/services/api';

import { Gym } from '../domain/entities/Gym';
import { GymRepository, ListNearbyParams } from '../domain/repositories/GymRepository';
import { GymDTO } from './dto/GymDTO';
import { mapGymDTOtoEntity } from './mappers/gym.mappers';
import { MOCK_UI } from '../data/datasources/GymMocks';

function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000;
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
      console.log('🔄 Intentando obtener gimnasios de la API...');

      // Intentar primero /cercanos:
      try {
        const res = await api.get('/api/gyms/cercanos', {
          params: { lat, lon: lng, radius },
        });
        const list: GymDTO[] = Array.isArray(res.data)
          ? res.data
          : (res.data?.data ?? []);

        if (list.length > 0) {
          console.log(
            '✅ Datos obtenidos de /api/gyms/cercanos:',
            list.length,
            'gimnasios',
          );
          return list
            .map(mapGymDTOtoEntity)
            .filter((g): g is Gym => !!g)
            .sort((a, b) => (a.distancia ?? Infinity) - (b.distancia ?? Infinity));
        }

        throw new Error('No hay datos en /cercanos');
      } catch (cercanoError) {
        console.log('⚠️ /cercanos falló, intentando /api/gyms...');

        // Fallback: /api/gyms
        const res = await api.get('/api/gyms');
        const list: GymDTO[] = Array.isArray(res.data) ? res.data : [];

        if (list.length > 0) {
          console.log('✅ Datos obtenidos de /api/gyms:', list.length, 'gimnasios');
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
      }
    } catch (apiError) {
      console.log('❌ API falló completamente, usando mocks...', apiError);

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
      console.log('🔄 Obteniendo todos los gimnasios de la API...');
      const res = await api.get('/api/gyms');
      const list: GymDTO[] = Array.isArray(res.data) ? res.data : [];

      if (list.length > 0) {
        console.log('✅ Datos obtenidos de /api/gyms:', list.length, 'gimnasios');
        return list.map(mapGymDTOtoEntity).filter((g): g is Gym => !!g);
      }

      throw new Error('No hay datos en la API');
    } catch (apiError) {
      console.log('❌ API falló, usando mocks para listAll...', apiError);
      return MOCK_UI;
    }
  }

  async getById(id: string): Promise<Gym | null> {
    try {
      console.log('🔄 Obteniendo gimnasio por ID de la API:', id);
      const res = await api.get(`/api/gyms/${id}`);
      const gym = mapGymDTOtoEntity(res.data);

      if (gym) {
        console.log('✅ Gimnasio obtenido de la API:', gym.name);
        return gym;
      }

      throw new Error('Gimnasio no encontrado en API');
    } catch (apiError) {
      console.log('❌ API falló, buscando en mocks...', apiError);
      const mockGym = MOCK_UI.find((g) => g.id === id);

      if (mockGym) {
        console.log('✅ Gimnasio encontrado en mocks:', mockGym.name);
        return mockGym;
      }

      console.log('❌ Gimnasio no encontrado ni en API ni en mocks');
      return null;
    }
  }
}
