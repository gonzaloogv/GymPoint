import { Gym, CreateGymDTO, UpdateGymDTO } from '../entities';

export interface GymRepository {
  getAllGyms(): Promise<Gym[]>;
  getGymById(id: number): Promise<Gym>;
  createGym(gym: CreateGymDTO): Promise<Gym>;
  updateGym(gym: UpdateGymDTO): Promise<Gym>;
  deleteGym(id: number): Promise<void>;
  getGymTypes(): Promise<string[]>;
}
