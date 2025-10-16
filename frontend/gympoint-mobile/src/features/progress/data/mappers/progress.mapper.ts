import { Progress } from '@features/progress/domain/entities/Progress';
import { ProgressDTO } from '../dto/ProgressDTO';

export const progressMapper = {
  toDomain(dto: ProgressDTO): Progress {
    return {
      streak: dto.streak,
      weekly: dto.weekly,
      physicalProgress: dto.physicalProgress,
      exerciseProgress: dto.exerciseProgress,
      achievements: dto.achievements,
      trends: dto.trends,
    };
  },

  toDTO(progress: Progress): ProgressDTO {
    return {
      streak: progress.streak,
      weekly: progress.weekly,
      physicalProgress: progress.physicalProgress,
      exerciseProgress: progress.exerciseProgress,
      achievements: progress.achievements,
      trends: progress.trends,
    };
  },
};
