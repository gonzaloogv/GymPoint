import { api } from '../../../shared/http/apiClient';
export const GymRemote = {
  listNearby: (lat: number, lng: number, radiusKm: number) =>
    api.get('/api/gyms/cercanos', { params: { lat, lng, radiusKm } }).then((r) => r.data),
};
