import { RoutineSession } from '../entities/RoutineHistory';
import { RoutineRepository } from '../repositories/RoutineRepository';

export class SaveRoutineSession {
  constructor(private repository: RoutineRepository) {}

  async execute(session: RoutineSession): Promise<void> {
    return await this.repository.saveSession(session);
  }
}
