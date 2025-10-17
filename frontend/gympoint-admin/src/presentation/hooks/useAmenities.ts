import { useQuery } from '@tanstack/react-query';
import { AmenityRepositoryImpl } from '@/data';

const amenityRepository = new AmenityRepositoryImpl();

export const useAmenities = () => {
  return useQuery({
    queryKey: ['amenities'],
    queryFn: () => amenityRepository.getAllAmenities(),
    staleTime: 1000 * 60 * 60, // 1 hora - las amenidades no cambian frecuentemente
  });
};


