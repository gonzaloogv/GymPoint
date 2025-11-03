import { RoutineSession } from '../entities/RoutineHistory';
import { RoutineRepository } from '../repositories/RoutineRepository';

export class GetLastRoutineSession {
  constructor(private repository: RoutineRepository) {}

  async execute(routineId: string): Promise<RoutineSession | null> {
    return await this.repository.getLastSession(routineId);
  }
}
