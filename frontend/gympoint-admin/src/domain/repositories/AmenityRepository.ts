import { Amenity } from '../entities';

export interface AmenityRepository {
  getAllAmenities(): Promise<Amenity[]>;
}


