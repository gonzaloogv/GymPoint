export interface Gym {
  id_gym: number;
  name: string;
  description: string;
  city: string;
  address: string;
  latitude: string | number;
  longitude: string | number;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  social_media: Record<string, string> | null;
  instagram: string | null;
  facebook: string | null;
  google_maps_url: string | null;
  registration_date: string;
  equipment: string[] | string;
  max_capacity: number | null;
  area_sqm: number | null;
  verified: boolean;
  featured: boolean;
  month_price: number;
  week_price: number;
  photo_url: string | null;
  auto_checkin_enabled: boolean;
  geofence_radius_meters: number;
  min_stay_minutes: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  amenities?: any[];
}

export interface CreateGymDTO {
  name: string;
  description: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  social_media?: Record<string, string>;
  instagram?: string;
  facebook?: string;
  google_maps_url?: string;
  equipment: string[] | string;
  max_capacity?: number;
  area_sqm?: number;
  verified?: boolean;
  featured?: boolean;
  month_price: number;
  week_price: number;
  photo_url?: string;
  auto_checkin_enabled?: boolean;
  geofence_radius_meters?: number;
  min_stay_minutes?: number;
}

export interface UpdateGymDTO extends Partial<CreateGymDTO> {
  id_gym: number;
}
