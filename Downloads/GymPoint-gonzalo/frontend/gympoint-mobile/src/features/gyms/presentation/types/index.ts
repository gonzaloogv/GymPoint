// Lo que viene desde tu API
export type GymDto = {
  id_gym: number;
  name: string;
  description?: string | null;
  city?: string | null;
  address?: string | null;
  latitude: string | number;
  longitude: string | number;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  social_media?: string | null;
  registration_date?: string | null;
  equipment?: string | null;
  month_price?: number | null;
  week_price?: number | null;

  /** 👇 Estos dos pueden venir en /gyms/cercanos u otros endpoints */
  distancia?: number; // en metros
  rating?: number | null; // si el backend lo devuelve
};

export type LatLng = {
  latitude: number;
  longitude: number;
};

export type Region = LatLng & {
  latitudeDelta: number;
  longitudeDelta: number;
};

export type MapLocation = {
  id: string;
  title: string;
  coordinate: LatLng;
};

export type GymLite = {
  id: string | number;
  name: string;
  distancia?: number;
  address?: string;
  hours?: string;
};
