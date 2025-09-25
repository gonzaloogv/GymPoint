import { GymRepository } from '../repositories/GymRepository';
export class ListNearbyGyms {
constructor(private repo: GymRepository) {}
execute(p:{lat:number; lng:number; radiusKm:number}) { return this.repo.listNearby(p); }
}