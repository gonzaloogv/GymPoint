import { Gym, GymDto } from '../types';

const toNum = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

export function mapGymDto(dto: GymDto): Gym | null {
  if (!dto) return null;

  const lat = toNum(dto.latitude);
  const lng = toNum(dto.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    id: String(dto.id_gym ?? ''), // siempre string interno
    name: dto.name ?? 'Gimnasio',
    lat,
    lng,
    address: dto.address ?? undefined,
    city: dto.city ?? undefined,
    description: dto.description ?? undefined,
    phone: dto.phone ?? null,
    email: dto.email ?? null,
    website: dto.website ?? null,
    social: dto.social_media ?? null,
    monthPrice: dto.month_price ?? null,
    weekPrice: dto.week_price ?? null,
    equipment: (dto.equipment ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),         // 👉 ["Pesas","cardio","boxeo"]
    // Estos campos quedan por si tu backend los agrega:
    hours: undefined,
    rating: undefined,
    distancia: undefined,
  };
}
