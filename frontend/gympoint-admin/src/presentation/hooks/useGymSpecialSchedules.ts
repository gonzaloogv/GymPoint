import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GymSpecialScheduleRepositoryImpl } from '@/data';
import { CreateGymSpecialScheduleDTO, UpdateGymSpecialScheduleDTO } from '@/domain';

const gymSpecialScheduleRepository = new GymSpecialScheduleRepositoryImpl();

export const useGymSpecialSchedules = (id_gym: number) => {
  return useQuery({
    queryKey: ['gymSpecialSchedules', id_gym],
    queryFn: () => gymSpecialScheduleRepository.getSpecialSchedulesByGymId(id_gym),
    enabled: !!id_gym,
  });
};

export const useCreateGymSpecialSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (schedule: CreateGymSpecialScheduleDTO) => gymSpecialScheduleRepository.createSpecialSchedule(schedule),
    onSuccess: (newSchedule) => {
      queryClient.invalidateQueries({ queryKey: ['gymSpecialSchedules', newSchedule.id_gym] });
    },
  });
};

export const useUpdateGymSpecialSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (schedule: UpdateGymSpecialScheduleDTO) => gymSpecialScheduleRepository.updateSpecialSchedule(schedule),
    onSuccess: (updatedSchedule) => {
      queryClient.invalidateQueries({ queryKey: ['gymSpecialSchedules', updatedSchedule.id_gym] });
    },
  });
};

export const useDeleteGymSpecialSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id_special_schedule, id_gym }: { id_special_schedule: number; id_gym: number }) => 
      gymSpecialScheduleRepository.deleteSpecialSchedule({ id_special_schedule, id_gym }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gymSpecialSchedules', variables.id_gym] });
    },
  });
};


