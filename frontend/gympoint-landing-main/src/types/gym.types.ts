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
    training_types: string[];
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
  'Wi-Fi',
  'Estacionamiento',
  'Vestuarios',
  'Aire Acondicionado',
  'Entrenadores Personales',
  'Clases Grupales',
  'Máquinas de Última Generación',
  'Bar Saludable',
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