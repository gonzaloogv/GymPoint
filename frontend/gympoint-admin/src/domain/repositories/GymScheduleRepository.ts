import { GymSchedule, CreateGymScheduleDTO, UpdateGymScheduleDTO, GymSpecialSchedule, CreateGymSpecialScheduleDTO } from '../entities';

export interface GymScheduleRepository {
  getSchedulesByGym(id_gym: number): Promise<GymSchedule[]>;
  createSchedule(schedule: CreateGymScheduleDTO): Promise<GymSchedule>;
  updateSchedule(schedule: UpdateGymScheduleDTO): Promise<GymSchedule>;
  
  getSpecialSchedulesByGym(id_gym: number): Promise<GymSpecialSchedule[]>;
  createSpecialSchedule(schedule: CreateGymSpecialScheduleDTO): Promise<GymSpecialSchedule>;
}




