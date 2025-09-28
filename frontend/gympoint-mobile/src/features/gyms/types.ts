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
    distancia?: number;          // en metros
    rating?: number | null;      // si el backend lo devuelve
  };
  
// Modelo interno que usa el frontend en TODOS lados (mapa/lista/filtros)
export type Gym = {
    id: string;
    name: string;
    lat: number;
    lng: number;
    address?: string;
    city?: string;
    description?: string;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    social?: string | null;
    monthPrice?: number | null;
    weekPrice?: number | null;
    equipment: string[];       // 👈 array normalizado
    hours?: string;            // si más adelante tu API manda horarios
    rating?: number;           // idem
    distancia?: number;        // calculada o enviada por backend
};
  