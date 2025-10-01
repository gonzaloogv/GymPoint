// src/features/gyms/domain/entities/Gym.ts
export type GymId = string;

export interface Gym {
  id: GymId;
  name: string;
  address?: string;
  city?: string;
  lat: number;
  lng: number;
  monthPrice?: number; // normalizado
  weekPrice?: number;
  equipment?: string[]; // normalizado
  distancia?: number; // en metros (opcional)
}
