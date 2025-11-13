import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RewardRepositoryImpl } from '@/data';
import { CreateRewardDTO, UpdateRewardDTO } from '@/domain';

const rewardRepository = new RewardRepositoryImpl();

/**
 * Hook para obtener todas las recompensas
 */
export const useRewards = () => {
  return useQuery({
    queryKey: ['rewards'],
    queryFn: () => rewardRepository.getAllRewards(),
  });
};

/**
 * Hook para obtener una recompensa por ID
 */
export const useReward = (id: number) => {
  return useQuery({
    queryKey: ['rewards', id],
    queryFn: () => rewardRepository.getRewardById(id),
    enabled: !!id,
  });
};

/**
 * Hook para crear una nueva recompensa
 */
export const useCreateReward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reward: CreateRewardDTO) => rewardRepository.createReward(reward),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
};

/**
 * Hook para actualizar una recompensa existente
 */
export const useUpdateReward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reward: UpdateRewardDTO) => rewardRepository.updateReward(reward),
    onSuccess: (updatedReward) => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['rewards', updatedReward.id_reward] });
    },
  });
};

/**
 * Hook para eliminar una recompensa
 */
export const useDeleteReward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => rewardRepository.deleteReward(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
};

/**
 * Hook para obtener estadísticas de recompensas
 */
export const useRewardStats = () => {
  return useQuery({
    queryKey: ['rewardStats'],
    queryFn: () => rewardRepository.getRewardStats(),
  });
};




