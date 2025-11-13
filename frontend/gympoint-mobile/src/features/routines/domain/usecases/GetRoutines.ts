import { Routine } from '../entities/Routine';
import { RoutineRepository } from '../repositories/RoutineRepository';

export class GetRoutines {
  constructor(private repository: RoutineRepository) {}

  async execute(): Promise<Routine[]> {
    return await this.repository.getAll();
  }
}
