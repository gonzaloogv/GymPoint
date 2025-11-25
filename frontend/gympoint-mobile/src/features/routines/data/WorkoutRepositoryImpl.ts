import { WorkoutRepository } from '../domain/repositories/WorkoutRepository';
import {
  WorkoutSession,
  WorkoutSet,
  StartWorkoutSessionRequest,
  RegisterWorkoutSetRequest,
  UpdateWorkoutSetRequest,
  CompleteWorkoutSessionRequest,
  WorkoutStats,
} from '../domain/entities/WorkoutSession';
import { workoutApi } from './remote/workout.api';
import { workoutMappers } from './mappers/workout.mapper';

/**
 * Workout Repository Implementation
 * Implementa la interfaz WorkoutRepository usando la API real
 */
export class WorkoutRepositoryImpl implements WorkoutRepository {
  async startSession(request: StartWorkoutSessionRequest): Promise<WorkoutSession> {
    try {
      const requestDTO = workoutMappers.startWorkoutSessionRequestToDTO(request);
      const response = await workoutApi.startSession(requestDTO);
      return workoutMappers.workoutSessionDTOToEntity(response.data);
    } catch (error: any) {
      console.error('[WorkoutRepo] ❌ Error iniciando sesión:', error?.message);
      throw error;
    }
  }

  async getActiveSession(): Promise<WorkoutSession | null> {
    try {
      const response = await workoutApi.getActiveSession();
      return workoutMappers.workoutSessionDTOToEntity(response.data);
    } catch (error: any) {
      // Si no hay sesión activa, retornar null
      if (error?.response?.status === 404 || error?.response?.data?.error?.code === 'NO_ACTIVE_SESSION') {
        return null;
      }
      console.error('[WorkoutRepo] ❌ Error obteniendo sesión activa:', error?.message);
      throw error;
    }
  }

  async getMySessions(params?: {
    status?: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    id_routine?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }): Promise<WorkoutSession[]> {
    const response = await workoutApi.getMySessions(params);
    return workoutMappers.workoutSessionDTOsToEntities(response.data);
  }

  async getSessionById(id: number): Promise<WorkoutSession> {
    const response = await workoutApi.getSessionById(id);
    return workoutMappers.workoutSessionDTOToEntity(response.data);
  }

  async updateSession(id: number, notes: string): Promise<WorkoutSession> {
    const response = await workoutApi.updateSession(id, { notes });
    return workoutMappers.workoutSessionDTOToEntity(response.data);
  }

  async completeSession(
    id: number,
    request?: CompleteWorkoutSessionRequest
  ): Promise<WorkoutSession> {
    try {
      const requestDTO = request ? workoutMappers.completeWorkoutSessionRequestToDTO(request) : undefined;
      const response = await workoutApi.completeSession(id, requestDTO);
      return workoutMappers.workoutSessionDTOToEntity(response.data);
    } catch (error: any) {
      console.error('[WorkoutRepo] ❌ Error completando sesión:', error?.message);
      throw error;
    }
  }

  async cancelSession(id: number): Promise<WorkoutSession> {
    try {
      const response = await workoutApi.cancelSession(id);
      return workoutMappers.workoutSessionDTOToEntity(response.data);
    } catch (error: any) {
      console.error('[WorkoutRepo] ❌ Error cancelando sesión:', error?.message);
      throw error;
    }
  }

  async getStats(params?: { start_date?: string; end_date?: string }): Promise<WorkoutStats> {
    const response = await workoutApi.getStats(params);
    return response.data;
  }

  async getSessionSets(sessionId: number, exerciseId?: number): Promise<WorkoutSet[]> {
    const response = await workoutApi.getSessionSets(sessionId, exerciseId);
    return workoutMappers.workoutSetDTOsToEntities(response.data);
  }

  async registerSet(
    sessionId: number,
    request: RegisterWorkoutSetRequest
  ): Promise<WorkoutSet> {
    try {
      const requestDTO = workoutMappers.registerWorkoutSetRequestToDTO(request);
      const response = await workoutApi.registerSet(sessionId, requestDTO);
      return workoutMappers.workoutSetDTOToEntity(response.data);
    } catch (error: any) {
      console.error('[WorkoutRepo] ❌ Error registrando set:', error?.message);
      throw error;
    }
  }

  async updateSet(setId: number, request: UpdateWorkoutSetRequest): Promise<WorkoutSet> {
    const requestDTO = workoutMappers.updateWorkoutSetRequestToDTO(request);
    const response = await workoutApi.updateSet(setId, requestDTO);
    return workoutMappers.workoutSetDTOToEntity(response.data);
  }

  async deleteSet(setId: number): Promise<void> {
    await workoutApi.deleteSet(setId);
  }

  async getLastSetsForExercises(exerciseIds: number[]): Promise<Array<{
    id_exercise: number;
    last_weight: number;
    last_reps: number;
    has_history: boolean;
  }>> {
    try {
      const response = await workoutApi.getLastSetsForExercises(exerciseIds);
      return response.data;
    } catch (error: any) {
      console.error('[WorkoutRepo] ❌ Error obteniendo últimos sets:', error?.message);
      return [];
    }
  }
}

// Export singleton instance
export const workoutRepository = new WorkoutRepositoryImpl();
