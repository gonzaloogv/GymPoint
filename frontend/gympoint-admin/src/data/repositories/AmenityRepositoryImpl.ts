import { AmenityRepository, Amenity } from '@/domain';
import { apiClient } from '../api';

export class AmenityRepositoryImpl implements AmenityRepository {
  async getAllAmenities(): Promise<Amenity[]> {
    const response = await apiClient.get<Amenity[]>('/gyms/amenidades');
    return response.data;
  }
}


