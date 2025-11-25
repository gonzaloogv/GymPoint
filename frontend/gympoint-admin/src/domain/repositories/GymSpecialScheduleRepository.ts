import { GymSpecialSchedule, CreateGymSpecialScheduleDTO, UpdateGymSpecialScheduleDTO } from '../entities';

export interface GymSpecialScheduleRepository {
  getSpecialSchedulesByGymId(id_gym: number): Promise<GymSpecialSchedule[]>;
  createSpecialSchedule(schedule: CreateGymSpecialScheduleDTO): Promise<GymSpecialSchedule>;
  updateSpecialSchedule(schedule: UpdateGymSpecialScheduleDTO): Promise<GymSpecialSchedule>;
  deleteSpecialSchedule(id: number): Promise<void>;
}


