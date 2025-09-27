import { api } from '../../../services/api';

export type Gym = {
  id: number | string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  rating?: number;
  distancia?: number; // en metros
  equipment?: string;
};

// --- utils ---
const toNum = (v: any) => (v === null || v === undefined ? NaN : Number(v));
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
  return 2 * R * Math.asin(Math.sqrt(h));
}

function dtoToGym(dto: any): Gym | null {
  const id = dto?.id_gym ?? dto?.id ?? 'unknown';
  const name = dto?.name ?? dto?.nombre ?? 'Gym';
  const equipment = dto?.equipment ?? dto?.equipamiento ?? 'Equipamiento';
  const lat = toNum(dto?.latitude ?? dto?.lat);
  const lng = toNum(dto?.longitude ?? dto?.lon ?? dto?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    id,
    name,
    lat,
    lng,
    address: dto?.address ?? dto?.direccion,
    rating: dto?.rating ?? dto?.score,
    distancia: dto?.distancia, // si el backend la manda en /cercanos
    equipment: dto?.equipamiento,
  };
}

export const GymsService = {
  /**
   * Intenta /api/gyms/cercanos (si existe). Si hay "Network Error" o 404,
   * cae a /api/gyms y calcula distancias en el cliente.
   */
  async listNearby(params: { lat: number; lng: number; radius?: number }): Promise<Gym[]> {
    const { lat, lng, radius = 10000 } = params;

    // 1) /cercanos (si tu backend lo tiene y API_BASE_URL es accesible)
    try {
      const res = await api.get('/api/gyms/cercanos', {
        params: { lat, lon: lng, radius },
      });
      const arr = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      if (Array.isArray(arr) && arr.length) {
        return arr
          .map(dtoToGym)
          .filter((g): g is Gym => !!g)
          .sort((a, b) => (a.distancia ?? Infinity) - (b.distancia ?? Infinity));
      }
    } catch (e) {
      console.log('[GymsService] /gyms failed → returning mock');
      return [
        { id: '1', name: 'BULLDOG CENTER',     lat: -27.4546453, lng: -58.9913384, address: '—', distancia: 200 },
        { id: '2', name: 'EQUILIBRIO FITNESS', lat: -27.4484469, lng: -58.9937996, address: '—', distancia: 500 },
        { id: '3', name: 'EXEN GYM',           lat: -27.4560971, lng: -58.9867207, address: '—', distancia: 900 },
      ];
    }

    // 2) Fallback: /api/gyms (como el JSON que pegaste)
    const res = await api.get('/api/gyms');
    const list: any[] = Array.isArray(res.data) ? res.data : [];
    const mapped = list
      .map(dtoToGym)
      .filter((g): g is Gym => !!g)
      .map((g) => ({
        ...g,
        distancia: distanceMeters({ lat, lng }, { lat: g.lat, lng: g.lng }),
      }));

    const filtered = mapped.filter((g) => (g.distancia ?? Infinity) <= radius);
    filtered.sort((a, b) => (a.distancia ?? Infinity) - (b.distancia ?? Infinity));
    return filtered;
  },
};
