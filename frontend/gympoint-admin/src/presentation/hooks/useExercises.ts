import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExerciseRepositoryImpl } from '@/data/repositories/ExerciseRepositoryImpl';
import { CreateExerciseDTO, UpdateExerciseDTO } from '@/domain';

const exerciseRepository = new ExerciseRepositoryImpl();

export const useExercises = () => {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: () => exerciseRepository.getAllExercises(),
    staleTime: 1000 * 60 * 30, // 30 minutos - los ejercicios no cambian frecuentemente
  });
};

export const useExercise = (id: number) => {
  return useQuery({
    queryKey: ['exercise', id],
    queryFn: () => exerciseRepository.getExerciseById(id),
    enabled: !!id,
  });
};

export const useCreateExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exercise: CreateExerciseDTO) => exerciseRepository.createExercise(exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
};

export const useUpdateExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exercise: UpdateExerciseDTO) => exerciseRepository.updateExercise(exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => exerciseRepository.deleteExercise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
};

