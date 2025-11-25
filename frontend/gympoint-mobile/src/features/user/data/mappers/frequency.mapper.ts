import { Frequency } from '../../domain/entities/Frequency';
import { FrequencyResponseDTO } from '../dto/user.dto';

export const mapFrequencyDTOToEntity = (dto: FrequencyResponseDTO): Frequency => {
  return {
    id_frequency: dto.id_frequency,
    id_user: dto.id_user,
    goal: dto.goal,
    pending_goal: dto.pending_goal,
    assist: dto.assist,
    achieved_goal: dto.achieved_goal,
    week_start_date: dto.week_start_date,
    week_number: dto.week_number,
    year: dto.year,
  };
};
