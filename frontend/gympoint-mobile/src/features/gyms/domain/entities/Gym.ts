// src/features/gyms/domain/entities/Gym.ts
export type GymId = number;

export interface Amenity {
  id_amenity: number;
  name: string;
  icon?: string;
}

export interface EquipmentItem {
  name: string;
  quantity: number;
}

export type EquipmentByCategory = Record<string, EquipmentItem[]>;

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
  equipment?: EquipmentByCategory; // Equipamiento categorizado: { "fuerza": [{ name: "Banco press", quantity: 4 }], "cardio": [...] }
  services?: string[]; // Servicios/tipos del gimnasio: ["Funcional", "CrossFit", "Musculación"]
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
