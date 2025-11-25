// src/features/gyms/data/GymRepositoryImpl.ts
import { api } from '@shared/http/apiClient';

import { Gym } from '../domain/entities/Gym';
import { GymRepository, ListNearbyParams } from '../domain/repositories/GymRepository';
import { GymDTO } from './dto/GymDTO';
import { mapGymDTOtoEntity } from './mappers/gym.mappers';

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
      console.log('[GymRepositoryImpl] 🔄 Fetching gyms from /api/gyms...');
      console.log('[GymRepositoryImpl] Params:', { lat, lng, radius });

      // Obtener todos los gimnasios
      const res = await api.get('/api/gyms');

      console.log('[GymRepositoryImpl] 📦 Response received');
      console.log('[GymRepositoryImpl] Response type:', typeof res.data);
      console.log('[GymRepositoryImpl] Is array?', Array.isArray(res.data));

      // Extraer la lista de gimnasios (manejar respuesta paginada)
      let list: GymDTO[];

      if (Array.isArray(res.data)) {
        // Caso 1: Respuesta directa como array
        console.log('[GymRepositoryImpl] ✅ Direct array response');
        list = res.data;
      } else if (res.data?.items && Array.isArray(res.data.items)) {
        // Caso 2: Respuesta paginada con campo "items"
        console.log('[GymRepositoryImpl] ✅ Paginated response with items field');
        console.log('[GymRepositoryImpl] Items count:', res.data.items.length);
        console.log('[GymRepositoryImpl] Page:', res.data.page, 'Total:', res.data.total);
        list = res.data.items;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        // Caso 3: Respuesta con campo "data"
        console.log('[GymRepositoryImpl] ✅ Response with data field');
        list = res.data.data;
      } else {
        // Caso 4: Estructura desconocida
        console.error('[GymRepositoryImpl] ❌ Unexpected response structure:');
        console.error('[GymRepositoryImpl] Keys:', Object.keys(res.data || {}));
        console.error('[GymRepositoryImpl] Full response:', JSON.stringify(res.data, null, 2));
        list = [];
      }

      console.log('[GymRepositoryImpl] 📊 Extracted list length:', list.length);

      if (list.length > 0) {
        console.log('[GymRepositoryImpl] 🗺️  Calculating distances and filtering by radius...');

        // Calcular distancia en el cliente y filtrar por radio
        const gyms = list
          .map(mapGymDTOtoEntity)
          .filter((g): g is Gym => !!g)
          .map((g) => ({
            ...g,
            distancia: distanceMeters({ lat, lng }, { lat: g.lat, lng: g.lng }),
          }))
          .filter((g) => (g.distancia ?? Infinity) <= radius)
          .sort((a, b) => (a.distancia ?? Infinity) - (b.distancia ?? Infinity));

        console.log('[GymRepositoryImpl] ✅ Gyms nearby:', gyms.length);
        return gyms;
      }

      console.warn('[GymRepositoryImpl] ⚠️  No gyms in response');
      return [];
    } catch (apiError) {
      console.error('[GymRepositoryImpl] ❌ Error fetching gyms:', {
        message: apiError instanceof Error ? apiError.message : String(apiError),
        response: (apiError as any)?.response?.data,
        status: (apiError as any)?.response?.status,
      });
      return [];
    }
  }

  async listAll(): Promise<Gym[]> {
    try {
      console.log('[GymRepositoryImpl] 🔄 Fetching all gyms from /api/gyms...');
      const res = await api.get('/api/gyms');

      // Extraer la lista de gimnasios (manejar respuesta paginada)
      let list: GymDTO[];

      if (Array.isArray(res.data)) {
        console.log('[GymRepositoryImpl] ✅ Direct array response');
        list = res.data;
      } else if (res.data?.items && Array.isArray(res.data.items)) {
        console.log('[GymRepositoryImpl] ✅ Paginated response - Items:', res.data.items.length);
        list = res.data.items;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        console.log('[GymRepositoryImpl] ✅ Response with data field');
        list = res.data.data;
      } else {
        console.error('[GymRepositoryImpl] ❌ Unexpected response structure');
        list = [];
      }

      if (list.length > 0) {
        const gyms = list.map(mapGymDTOtoEntity).filter((g): g is Gym => !!g);
        console.log('[GymRepositoryImpl] ✅ All gyms loaded:', gyms.length);
        return gyms;
      }

      console.warn('[GymRepositoryImpl] ⚠️  No gyms in response');
      return [];
    } catch (apiError) {
      console.error('[GymRepositoryImpl] ❌ Error fetching all gyms:', {
        message: apiError instanceof Error ? apiError.message : String(apiError),
        response: (apiError as any)?.response?.data,
        status: (apiError as any)?.response?.status,
      });
      return [];
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
      console.error(`Error fetching gym ${id}:`, apiError);
      return null;
    }
  }
}
