import { UserRoutineRepository } from '../domain/repositories/UserRoutineRepository';
import {
  UserRoutine,
  ActiveUserRoutineWithDetails,
  AssignRoutineRequest,
  UserRoutineCounts,
} from '../domain/entities/UserRoutine';
import { userRoutineApi } from './remote/userRoutine.api';
import {
  userRoutineMappers,
  assignRoutineRequestToDTO,
} from './mappers/userRoutine.mapper';

/**
 * UserRoutine Repository Implementation
 * Implementa la interfaz UserRoutineRepository usando la API real
 */
export class UserRoutineRepositoryImpl implements UserRoutineRepository {
  async assignRoutine(request: AssignRoutineRequest): Promise<UserRoutine> {
    const requestDTO = assignRoutineRequestToDTO(request);
    const response = await userRoutineApi.assign(requestDTO);
    return userRoutineMappers.userRoutineDTOToEntity(response.data);
  }

  async getActiveRoutine(): Promise<UserRoutine> {
    const response = await userRoutineApi.getActive();
    return userRoutineMappers.userRoutineDTOToEntity(response.data);
  }

  async getActiveRoutineWithExercises(): Promise<ActiveUserRoutineWithDetails> {
    const response = await userRoutineApi.getActiveWithExercises();
    return userRoutineMappers.activeUserRoutineDTOToEntity(response.data);
  }

  async endActiveRoutine(): Promise<UserRoutine> {
    const response = await userRoutineApi.endActive();
    return userRoutineMappers.userRoutineDTOToEntity(response.data);
  }

  async getUserRoutineCounts(): Promise<UserRoutineCounts> {
    const response = await userRoutineApi.getCounts();
    return userRoutineMappers.userRoutineCountsDTOToEntity(response.data);
  }
}

// Export singleton instance
export const userRoutineRepository = new UserRoutineRepositoryImpl();
