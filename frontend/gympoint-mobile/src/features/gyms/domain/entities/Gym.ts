// src/features/gyms/domain/entities/Gym.ts
export type GymId = string;

export interface Amenity {
  id_amenity: number;
  name: string;
  icon?: string;
}

export interface Gym {
  id: GymId;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  lat: number;
  lng: number;
  monthPrice?: number;
  weekPrice?: number;
  equipment?: string[]; // Array de strings: ["Pesas", "Cardio", "Boxeo"]
  rules?: string[]; // Array de reglas del gimnasio
  amenities?: Amenity[]; // Servicios/comodidades
  distancia?: number; // en metros (opcional)
  
  // Información de contacto
  phone?: string;
  email?: string;
  website?: string;
  google_maps_url?: string;
  
  // Configuración de check-in
  geofence_radius_meters?: number;
  min_stay_minutes?: number;
  auto_checkin_enabled?: boolean;
  
  // Estado
  verified?: boolean;
  featured?: boolean;
  is_active?: boolean;
}
