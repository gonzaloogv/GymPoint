import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AchievementRepositoryImpl } from '@/data';
import type {
  AchievementCategory,
  AchievementDefinition,
  AchievementDefinitionInput,
  UpdateAchievementDefinitionInput
} from '@/domain';

const achievementRepository = new AchievementRepositoryImpl();

interface UseAchievementsOptions {
  category?: AchievementCategory;
  includeInactive?: boolean;
}

export const useAchievements = (options?: UseAchievementsOptions) => {
  return useQuery<AchievementDefinition[]>({
    queryKey: ['achievements', options?.category, options?.includeInactive ?? true],
    queryFn: () =>
      achievementRepository.getDefinitions({
        category: options?.category,
        includeInactive: options?.includeInactive ?? true,
      }),
  });
};

export const useCreateAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AchievementDefinitionInput) => achievementRepository.createDefinition(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    }
  });
};

export const useUpdateAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAchievementDefinitionInput) =>
      achievementRepository.updateDefinition(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    }
  });
};

export const useDeleteAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => achievementRepository.deleteDefinition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    }
  });
};

