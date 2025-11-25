// src/features/gyms/data/dto/GymDTO.ts
export interface AmenityDTO {
  id_amenity: number;
  name: string;
  icon?: string;
}

export interface GymDTO {
  id_gym: number;
  name: string;
  description?: string;
  city?: string;
  address?: string;
  latitude: string | number | null;
  longitude: string | number | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  google_maps_url?: string | null;
  
  // Equipment y amenities pueden venir como array o null
  equipment?: string[] | null;
  rules?: string[] | null;
  amenities?: AmenityDTO[] | null;
  
  month_price?: number | string | null;
  week_price?: number | string | null;
  
  // Configuración de check-in
  geofence_radius_meters?: number;
  min_stay_minutes?: number;
  auto_checkin_enabled?: boolean;
  
  // Estado
  verified?: boolean;
  featured?: boolean;
  is_active?: boolean;
  
  // Distancia (calculada)
  distancia?: number;
  distance_km?: number | string;
  distance?: number | string;
}
