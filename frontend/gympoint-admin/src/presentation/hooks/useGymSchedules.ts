import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GymScheduleRepositoryImpl } from '@/data';
import { CreateGymScheduleDTO, UpdateGymScheduleDTO, CreateGymSpecialScheduleDTO } from '@/domain';

const gymScheduleRepository = new GymScheduleRepositoryImpl();

export const useGymSchedules = (id_gym: number) => {
  return useQuery({
    queryKey: ['gym-schedules', id_gym],
    queryFn: () => gymScheduleRepository.getSchedulesByGym(id_gym),
    enabled: !!id_gym,
  });
};

export const useCreateGymSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedule: CreateGymScheduleDTO) => gymScheduleRepository.createSchedule(schedule),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gym-schedules', variables.id_gym] });
    },
  });
};

export const useUpdateGymSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedule: UpdateGymScheduleDTO) => gymScheduleRepository.updateSchedule(schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-schedules'] });
    },
  });
};
