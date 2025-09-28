// src/features/gyms/domain/repositories/GymRepository.ts
import { Gym } from '../entities/Gym';

export interface ListNearbyParams {
  lat: number;
  lng: number;
  radius?: number; // metros
}

export interface GymRepository {
  listNearby(params: ListNearbyParams): Promise<Gym[]>;
  listAll(): Promise<Gym[]>;
  getById(id: string): Promise<Gym | null>;
}
