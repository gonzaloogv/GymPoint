import { RoutineSession } from '../entities/RoutineHistory';
import { RoutineRepository } from '../repositories/RoutineRepository';

export class GetRoutineHistory {
  constructor(private repository: RoutineRepository) {}

  async execute(routineId: string): Promise<RoutineSession[]> {
    return await this.repository.getHistory(routineId);
  }
}
