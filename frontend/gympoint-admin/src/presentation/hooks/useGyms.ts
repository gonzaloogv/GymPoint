import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GymRepositoryImpl } from '@/data';
import { CreateGymDTO, UpdateGymDTO } from '@/domain';

const gymRepository = new GymRepositoryImpl();

export const useGyms = () => {
  return useQuery({
    queryKey: ['gyms'],
    queryFn: () => gymRepository.getAllGyms(),
  });
};

export const useGymById = (id: number) => {
  return useQuery({
    queryKey: ['gym', id],
    queryFn: () => gymRepository.getGymById(id),
    enabled: !!id,
  });
};

export const useGymTypes = () => {
  return useQuery({
    queryKey: ['gym-types'],
    queryFn: () => gymRepository.getGymTypes(),
  });
};

export const useCreateGym = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gym: CreateGymDTO) => gymRepository.createGym(gym),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
    },
  });
};

export const useUpdateGym = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gym: UpdateGymDTO) => gymRepository.updateGym(gym),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
    },
  });
};

export const useDeleteGym = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => gymRepository.deleteGym(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
    },
  });
};
