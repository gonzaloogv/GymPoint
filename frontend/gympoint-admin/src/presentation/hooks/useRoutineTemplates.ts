import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoutineTemplateRepositoryImpl } from '@/data';
import { CreateRoutineTemplateDTO, UpdateRoutineTemplateDTO } from '@/domain';

const routineTemplateRepository = new RoutineTemplateRepositoryImpl();

export const useRoutineTemplates = () => {
  return useQuery({
    queryKey: ['routineTemplates'],
    queryFn: () => routineTemplateRepository.getAllTemplates(),
  });
};

export const useRoutineTemplate = (id: number) => {
  return useQuery({
    queryKey: ['routineTemplate', id],
    queryFn: () => routineTemplateRepository.getTemplateById(id),
    enabled: !!id,
  });
};

export const useCreateRoutineTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (template: CreateRoutineTemplateDTO) => routineTemplateRepository.createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routineTemplates'] });
    },
  });
};

export const useUpdateRoutineTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (template: UpdateRoutineTemplateDTO) => routineTemplateRepository.updateTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routineTemplates'] });
    },
  });
};

export const useDeleteRoutineTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => routineTemplateRepository.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routineTemplates'] });
    },
  });
};


