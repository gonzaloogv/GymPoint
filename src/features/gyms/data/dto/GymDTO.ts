// src/features/gyms/data/dto/GymDTO.ts
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
    social_media?: string | null;
    registration_date?: string;
    equipment?: string;                // "Pesas, cardio, boxeo"
    month_price?: number | string | null;
    week_price?: number | string | null;
    distancia?: number;                // (si viene de /cercanos)
}