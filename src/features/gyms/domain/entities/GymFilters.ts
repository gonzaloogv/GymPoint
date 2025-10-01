// src/features/gyms/domain/entities/GymFilters.ts
import { PriceRange } from '../entities/value-objects/PriceRange';

export interface GymFilters {
  search?: string;          // nombre, dirección, ciudad
  services?: string[];      // ['Pesas', 'Cardio']
  price?: PriceRange | null; // ej. { min: 13000, max: 20000 } o { min: 5000 }
  time?: string | null;     // '24 horas', 'Abierto ahora', etc. (cuando tengas)
}
