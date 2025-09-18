import { Gym } from '../entities/Gym';
export interface GymRepository {
    listNearby(params: { lat: number; lng: number; radiusKm: number }): Promise<Gym[]>;
}