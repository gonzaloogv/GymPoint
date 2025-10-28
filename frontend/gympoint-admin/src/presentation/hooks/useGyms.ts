import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GymRepositoryImpl } from '@/data';
import { CreateGymDTO, UpdateGymDTO, GymRequest } from '@/domain';
import { apiClient } from '@/data/api/client';

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

// ===== Gym Requests Hooks =====

export const useGymRequests = (status?: 'pending' | 'approved' | 'rejected') => {
  return useQuery({
    queryKey: ['gym-requests', status],
    queryFn: async () => {
      const params = status ? { status } : {};
      const response = await apiClient.get('/gym-requests', { params });
      return response.data.data as GymRequest[];
    },
  });
};

export const useApproveGymRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(`/gym-requests/${id}/approve`, {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-requests'] });
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
    },
  });
};

export const useRejectGymRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const response = await apiClient.post(`/gym-requests/${id}/reject`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-requests'] });
    },
  });
};

export const useDeleteGymRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/gym-requests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-requests'] });
    },
  });
};
