export interface GymFormData {
  name: string;
  location: {
    address: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
  };
  contact: {
    email: string;
    phone: string;
    social_media: {
      instagram: string;
      facebook: string;
    };
  };

  attributes: {
    photos: string[];
    equipment: Record<string, Array<{ name: string; quantity: number }>>; // Equipamiento categorizado
    services: string[]; // Servicios/tipos de entrenamiento
    rules: string[]; // Reglas del gimnasio
  };
  pricing: {
    monthly: number | null;
    weekly: number | null;
    daily: number | null;
  };

  description: string;
  schedule: DaySchedule[];
  amenities: string[];
}

export interface DaySchedule {
  day: string;
  opens: string;
  closes: string;
  is_open: boolean;
}

export const TRAINING_TYPES = [
  'Pesas',
  'Funcional',
  'Cardio',
  'Crossfit',
  'Terapéutico',
  'Yoga',
  'Pilates',
  'Box',
  'Spinning',
  'Zumba',
] as const;

export const AMENITIES = [
  'Duchas',
  'Lockers',
  'WiFi',
  'Estacionamiento',
  'Aire Acondicionado',
  'Vestuarios',
  'Agua Potable',
  'Entrenador Personal',
  'Clases Grupales',
  'Nutricionista',
  'Sauna',
  'Piscina',
  'Máquinas Cardio',
  'Pesas Libres',
  'Máquinas de Fuerza',
  'Área Funcional',
  'Barras y Discos',
  'Mancuernas',
] as const;

export const DAYS_OF_WEEK = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
] as const;

export type TrainingType = typeof TRAINING_TYPES[number];
export type Amenity = typeof AMENITIES[number];
export type DayOfWeek = typeof DAYS_OF_WEEK[number];