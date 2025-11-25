import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DailyChallengeRepositoryImpl } from '@/data';
import {
  CreateDailyChallengeDTO,
  UpdateDailyChallengeDTO,
  CreateDailyChallengeTemplateDTO,
  UpdateDailyChallengeTemplateDTO
} from '@/domain';

const repository = new DailyChallengeRepositoryImpl();

export const useDailyChallenges = (params?: { from?: string; to?: string; include_inactive?: boolean }) => {
  return useQuery({
    queryKey: ['daily-challenges', params],
    queryFn: () => repository.getChallenges(params)
  });
};

export const useDailyChallengeTemplates = () => {
  return useQuery({
    queryKey: ['daily-challenge-templates'],
    queryFn: () => repository.getTemplates()
  });
};

export const useDailyChallengeConfig = () => {
  return useQuery({
    queryKey: ['daily-challenge-config'],
    queryFn: () => repository.getConfig()
  });
};

export const useCreateDailyChallenge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDailyChallengeDTO) => repository.createChallenge(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });
    }
  });
};

export const useUpdateDailyChallenge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateDailyChallengeDTO) => repository.updateChallenge(payload),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['daily-challenge-config'] });
    }
  });
};

export const useDeleteDailyChallenge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => repository.deleteChallenge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });
    }
  });
};

export const useCreateDailyChallengeTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDailyChallengeTemplateDTO) => repository.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenge-templates'] });
    }
  });
};

export const useUpdateDailyChallengeTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateDailyChallengeTemplateDTO) => repository.updateTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenge-templates'] });
    }
  });
};

export const useDeleteDailyChallengeTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => repository.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenge-templates'] });
      queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });
    }
  });
};

export const useUpdateDailyChallengeConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<{ auto_rotation_enabled: boolean; rotation_cron: string }>) =>
      repository.updateConfig(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenge-config'] });
    }
  });
};

export const useRunDailyChallengeRotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => repository.runRotation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-challenges'] });
    }
  });
};
