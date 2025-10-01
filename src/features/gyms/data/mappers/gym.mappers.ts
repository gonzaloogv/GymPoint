// src/features/gyms/data/mappers/gym.mapper.ts
import { Gym } from '../../domain/entities/Gym';
import { GymDTO } from '../dto/GymDTO';

const toNum = (v: any): number | undefined => {
  if (v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

function parseEquipment(e?: string): string[] | undefined {
  if (!e || typeof e !== 'string') return undefined;
  return e.split(',').map(s => s.trim()).filter(Boolean);
}

export function mapGymDTOtoEntity(dto: GymDTO): Gym | null {
  const lat = toNum(dto.latitude);
  const lng = toNum(dto.longitude);
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;

  return {
    id: String(dto.id_gym),
    name: dto.name ?? 'Gym',
    address: dto.address ?? undefined,
    city: dto.city ?? undefined,
    lat, lng,
    monthPrice: toNum(dto.month_price),
    weekPrice: toNum(dto.week_price),
    equipment: parseEquipment(dto.equipment),
    distancia: dto.distancia,
  };
}
