// src/features/gyms/data/mappers/gym.mapper.ts
import { Gym, EquipmentByCategory } from '../../domain/entities/Gym';
import { GymDTO } from '../dto/GymDTO';
import { GymResponseDTO } from '../dto/GymApiDTO';

/**
 * Mappers para transformar DTOs del backend a entidades del dominio
 * Alineado con OpenAPI backend (lote 3 - Gyms)
 */

const toNum = (v: any): number | undefined => {
  if (v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

function parseEquipment(e?: string): string[] | undefined {
  if (!e || typeof e !== 'string') return undefined;
  return e
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Mapea GymResponseDTO (OpenAPI) a Gym entity
 */
export function mapGymResponseToEntity(dto: GymResponseDTO): Gym | null {
  const lat = toNum(dto.latitude);
  const lng = toNum(dto.longitude);

  // Debug logging for coordinate conversion
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    console.warn('[mapGymResponseToEntity] ⚠️ Invalid coordinates for gym:', {
      gymId: dto.id_gym,
      gymName: dto.name,
      rawLatitude: dto.latitude,
      rawLongitude: dto.longitude,
      convertedLat: lat,
      convertedLng: lng,
    });
    return null;
  }

  return {
    id: dto.id_gym,
    name: dto.name,
    address: dto.address ?? undefined,
    city: dto.city ?? undefined,
    lat,
    lng,
    monthPrice: toNum(dto.month_price),
    weekPrice: toNum(dto.week_price),
    // equipment no está en el OpenAPI, podría venir en un campo description o en amenities
    equipment: undefined,
    // distance viene en el DTO si se calcula desde el backend
    distancia: dto.distance ? dto.distance * 1000 : undefined, // Convertir km a metros si viene
  };
}

/**
 * Backward compatibility: mapea desde el formato legacy GymDTO
 * @deprecated Usar mapGymResponseToEntity
 */
export function mapGymDTOtoEntity(dto: GymDTO): Gym | null {
  const lat = toNum(dto.latitude);
  const lng = toNum(dto.longitude);

  // Debug logging for coordinate conversion
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    console.warn('[mapGymDTOtoEntity] ⚠️ Invalid coordinates for gym (legacy):', {
      gymId: dto.id_gym,
      gymName: dto.name,
      rawLatitude: dto.latitude,
      rawLongitude: dto.longitude,
      convertedLat: lat,
      convertedLng: lng,
    });
    return null;
  }

  // Backend retorna distance_km, mapearlo a distancia
  const distancia = dto.distancia ?? (dto.distance_km ? toNum(dto.distance_km) : undefined);

  return {
    id: dto.id_gym,
    name: dto.name ?? 'Gym',
    description: dto.description ?? undefined,
    address: dto.address ?? undefined,
    city: dto.city ?? undefined,
    lat,
    lng,
    monthPrice: toNum(dto.month_price),
    weekPrice: toNum(dto.week_price),

    // Equipment: actualmente viene como string[] en el DTO legacy, eventualmente será EquipmentByCategory
    // Por ahora convertimos string[] a undefined (no lo mapeamos aún)
    equipment: undefined,
    rules: Array.isArray(dto.rules) ? dto.rules : undefined,
    amenities: Array.isArray(dto.amenities) ? dto.amenities : undefined,

    distancia: distancia ? distancia * 1000 : undefined, // Convertir km a metros

    // Información de contacto
    phone: dto.phone ?? undefined,
    email: dto.email ?? undefined,
    website: dto.website ?? undefined,
    google_maps_url: dto.google_maps_url ?? undefined,

    // Configuración de check-in
    geofence_radius_meters: dto.geofence_radius_meters,
    min_stay_minutes: dto.min_stay_minutes,
    auto_checkin_enabled: dto.auto_checkin_enabled,

    // Estado
    verified: dto.verified,
    featured: dto.featured,
    is_active: dto.is_active,
  };
}
