import { RoutineRepository } from '../domain/repositories/RoutineRepository';
import { Routine, CreateRoutineRequest, UpdateRoutineRequest } from '../domain/entities/Routine';
import { routineApi } from './remote/routine.api';
import {
  routineMappers,
  createRoutineRequestToDTO,
  updateRoutineRequestToDTO,
} from './mappers/routine.mapper';

/**
 * Routine Repository Implementation
 * Implementa la interfaz RoutineRepository usando la API real
 */
export class RoutineRepositoryImpl implements RoutineRepository {
  async create(request: CreateRoutineRequest): Promise<Routine> {
    const requestDTO = createRoutineRequestToDTO(request);
    const response = await routineApi.create(requestDTO);
    return routineMappers.routineDTOToEntity(response.data);
  }

  async getMyRoutines(): Promise<Routine[]> {
    const response = await routineApi.getMyRoutines();
    return routineMappers.routineDTOsToEntities(response.data);
  }

  async getTemplates(): Promise<Routine[]> {
    const response = await routineApi.getTemplates();
    return routineMappers.routineDTOsToEntities(response.data);
  }

  async getById(id: number): Promise<Routine> {
    const response = await routineApi.getById(id);
    return routineMappers.routineDTOToEntity(response.data);
  }

  async update(id: number, request: UpdateRoutineRequest): Promise<Routine> {
    const requestDTO = updateRoutineRequestToDTO(request);
    const response = await routineApi.update(id, requestDTO);
    return routineMappers.routineDTOToEntity(response.data);
  }

  async delete(id: number): Promise<void> {
    await routineApi.delete(id);
  }

  async clone(id: number): Promise<Routine> {
    const response = await routineApi.clone(id);
    return routineMappers.routineDTOToEntity(response.data);
  }

  async getMyRoutinesCounts(): Promise<{
    total_owned: number;
    imported_count: number;
    created_count: number;
  }> {
    const response = await routineApi.getMyRoutinesCounts();
    return response.data;
  }
}

// Export singleton instance
export const routineRepository = new RoutineRepositoryImpl();
