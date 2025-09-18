import { GymRepository } from '../domain/repositories/GymRepository';
import { GymRemote } from './gym.remote';
import { Gym } from '../domain/entities/Gym';


export class GymRepositoryImpl implements GymRepository {
async listNearby(p:{ lat:number; lng:number; radiusKm:number }): Promise<Gym[]> {
const data = await GymRemote.listNearby(p.lat, p.lng, p.radiusKm);
return data as Gym[];
}
}