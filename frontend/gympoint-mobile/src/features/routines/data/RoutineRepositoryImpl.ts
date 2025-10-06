import { Routine, RoutineSession } from '../domain/entities';
import { RoutineRepository } from '../domain/repositories/RoutineRepository';
import { RoutineLocal } from './datasources/RoutineLocal';
import {
  mapRoutineDTOToEntity,
  mapRoutineSessionDTOToEntity,
  mapRoutineSessionEntityToDTO,
} from './mappers/routine.mapper';

export class RoutineRepositoryImpl implements RoutineRepository {
  constructor(private local: RoutineLocal) {}

  async getAll(): Promise<Routine[]> {
    const dtos = await this.local.fetchAll();
    return dtos.map(mapRoutineDTOToEntity);
  }

  async getById(id: string): Promise<Routine> {
    const dto = await this.local.fetchById(id);
    return mapRoutineDTOToEntity(dto);
  }

  async getHistory(routineId: string): Promise<RoutineSession[]> {
    const dtos = await this.local.fetchHistory(routineId);
    return dtos.map(mapRoutineSessionDTOToEntity);
  }

  async saveSession(session: RoutineSession): Promise<void> {
    const dto = mapRoutineSessionEntityToDTO(session);
    await this.local.saveSession(dto);
  }
}
