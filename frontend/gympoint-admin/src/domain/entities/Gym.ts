import { Amenity } from './Amenity';

export interface EquipmentItem {
  name: string;
  quantity: number;
}

export type EquipmentByCategory = Record<string, EquipmentItem[]>;

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
  equipment: EquipmentByCategory; // Equipamiento categorizado: { "fuerza": [{ name: "Banco press", quantity: 4 }] }
  services: string[]; // Servicios/tipos del gimnasio: ["Funcional", "CrossFit", "Musculación"]
  max_capacity: number | null;
  area_sqm: number | null;
  verified: boolean;
  featured: boolean;
  trial_allowed: boolean;
  month_price: number;
  week_price: number;
  photo_url: string | null;
  auto_checkin_enabled: boolean;
  geofence_radius_meters: number;
  min_stay_minutes: number;
  rules: string[] | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  amenities?: Amenity[];
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
  equipment: EquipmentByCategory;
  services: string[];
  max_capacity?: number;
  area_sqm?: number;
  verified?: boolean;
  featured?: boolean;
  trial_allowed?: boolean;
  month_price: number;
  week_price: number;
  photo_url?: string;
  auto_checkin_enabled?: boolean;
  geofence_radius_meters?: number;
  min_stay_minutes?: number;
  rules?: string[];
  amenities?: number[];
}

export interface UpdateGymDTO extends Partial<CreateGymDTO> {
  id_gym: number;
}

export interface GymRequest {
  id_gym_request: number;
  name: string;
  description: string | null;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  photos: string[];
  equipment: EquipmentByCategory; // Equipamiento categorizado
  services: string[]; // Servicios/tipos
  rules: string[]; // Reglas del gimnasio
  monthly_price: number | null;
  weekly_price: number | null;
  daily_price: number | null;
  schedule: any[];
  amenities: number[]; // IDs de amenidades
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  id_gym: number | null;
  processed_by: number | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}
