// src/features/gyms/domain/usecases/ListNearbyGyms.ts
import { Gym } from '../entities/Gym';
import { GymRepository, ListNearbyParams } from '../repositories/GymRepository';

export class ListNearbyGyms {
  constructor(private repo: GymRepository) {}

  async execute(params: ListNearbyParams): Promise<Gym[]> {
    return this.repo.listNearby(params);
  }
}
