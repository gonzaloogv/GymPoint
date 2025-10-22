// src/features/gyms/data/mappers/gym.mapper.ts
import { Gym } from '../../domain/entities/Gym';
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
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;

  return {
    id: String(dto.id_gym),
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
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;

  // Backend retorna distance_km, mapearlo a distancia
  const distancia = dto.distancia ?? (dto.distance_km ? toNum(dto.distance_km) : undefined);

  return {
    id: String(dto.id_gym),
    name: dto.name ?? 'Gym',
    address: dto.address ?? undefined,
    city: dto.city ?? undefined,
    lat,
    lng,
    monthPrice: toNum(dto.month_price),
    weekPrice: toNum(dto.week_price),
    equipment: parseEquipment(dto.equipment),
    distancia: distancia ? distancia * 1000 : undefined, // Convertir km a metros
  };
}
