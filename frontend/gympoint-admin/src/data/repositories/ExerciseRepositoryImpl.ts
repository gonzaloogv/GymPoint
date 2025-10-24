import { ExerciseRepository } from '@/domain/repositories/ExerciseRepository';
import { Exercise, CreateExerciseDTO, UpdateExerciseDTO } from '@/domain';
import { apiClient } from '../api';
import { Exercise as ExerciseDTO, PaginatedExercisesResponse } from '../dto/types';
import {
  mapExerciseResponseToExercise,
  mapCreateExerciseToRequest,
  mapUpdateExerciseToRequest,
} from '../mappers/CommonMappers';

export class ExerciseRepositoryImpl implements ExerciseRepository {
  async getAllExercises(): Promise<Exercise[]> {
    const response = await apiClient.get<PaginatedExercisesResponse>('/api/exercises', {
      params: { page: 1, limit: 1000 }
    });
    return response.data.items.map(mapExerciseResponseToExercise);
  }

  async getExerciseById(id: number): Promise<Exercise> {
    const response = await apiClient.get<ExerciseDTO>(`/api/exercises/${id}`);
    return mapExerciseResponseToExercise(response.data);
  }

  async createExercise(exercise: CreateExerciseDTO): Promise<Exercise> {
    const request = mapCreateExerciseToRequest(exercise);
    const response = await apiClient.post<ExerciseDTO>('/api/exercises', request);
    return mapExerciseResponseToExercise(response.data);
  }

  async updateExercise(exercise: UpdateExerciseDTO): Promise<Exercise> {
    const { id_exercise, ...data } = exercise;
    const request = mapUpdateExerciseToRequest(data);
    const response = await apiClient.put<ExerciseDTO>(`/api/exercises/${id_exercise}`, request);
    return mapExerciseResponseToExercise(response.data);
  }

  async deleteExercise(id: number): Promise<void> {
    await apiClient.delete(`/api/exercises/${id}`);
  }
}

