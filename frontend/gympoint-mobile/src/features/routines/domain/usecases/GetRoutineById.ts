import { Routine } from '../entities/Routine';
import { RoutineRepository } from '../repositories/RoutineRepository';

export class GetRoutineById {
  constructor(private repository: RoutineRepository) {}

  async execute(id: string): Promise<Routine> {
    return await this.repository.getById(id);
  }
}

