import { api } from '../../../services/api';
import type { Gym, GymDto } from '../types';

// helpers
const toNum = (v: any) => (v === null || v === undefined ? NaN : Number(v));
const numOrUndef = (v: any) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);


function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function mapGymDto(dto: GymDto): Gym | null {
  if (!dto) return null;

  const lat = toNum(dto.latitude);
  const lng = toNum(dto.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    id: String(dto.id_gym),
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

    // 👇 Cambios clave
    rating: numOrUndef((dto as any).rating),
    distancia: numOrUndef((dto as any).distancia),

    equipment: (dto.equipment ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),

    hours: undefined,
  };
}

const MOCK_GYMS: Gym[] = [
  { id: '1', name: 'BULLDOG CENTER',     lat: -27.4546453, lng: -58.9913384, address: '—', equipment: [], distancia: 200 },
  { id: '2', name: 'EQUILIBRIO FITNESS', lat: -27.4484469, lng: -58.9937996, address: '—', equipment: [], distancia: 500 },
  { id: '3', name: 'EXEN GYM',           lat: -27.4560971, lng: -58.9867207, address: '—', equipment: [], distancia: 900 },
];

export const GymsService = {
  async listNearby(params: { lat: number; lng: number; radius?: number }): Promise<Gym[]> {
    const { lat, lng, radius = 10000 } = params;

    try {
      const res = await api.get('/api/gyms/cercanos', { params: { lat, lon: lng, radius } });
      const arr: GymDto[] = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      if (arr.length) {
        return arr
          .map(mapGymDto)
          .filter((g): g is Gym => !!g)
          .sort((a, b) => (a.distancia ?? Infinity) - (b.distancia ?? Infinity));
      }
    } catch { /* fallback */ }

    try {
      const res = await api.get('/api/gyms');
      const list: GymDto[] = Array.isArray(res.data) ? res.data : [];
      const mapped = list
        .map(mapGymDto)
        .filter((g): g is Gym => !!g)
        .map(g => ({ ...g, distancia: distanceMeters({ lat, lng }, { lat: g.lat, lng: g.lng }) }));

      const filtered = mapped.filter(g => (g.distancia ?? Infinity) <= radius);
      filtered.sort((a, b) => (a.distancia ?? Infinity) - (b.distancia ?? Infinity));
      return filtered;
    } catch {
      return MOCK_GYMS;
    }
  },

  async listAll(): Promise<Gym[]> {
    const res = await api.get('/api/gyms');
    const list: GymDto[] = Array.isArray(res.data) ? res.data : [];
    return list.map(mapGymDto).filter((g): g is Gym => !!g);
  },
};

export type { Gym }; // opcional (para no cambiar imports existentes)
