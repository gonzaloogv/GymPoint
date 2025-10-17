import { ExerciseRepository } from '@/domain/repositories/ExerciseRepository';
import { Exercise, CreateExerciseDTO, UpdateExerciseDTO } from '@/domain';
import { apiClient } from '../api';

export class ExerciseRepositoryImpl implements ExerciseRepository {
  async getAllExercises(): Promise<Exercise[]> {
    const response = await apiClient.get<Exercise[]>('/exercises');
    return response.data;
  }

  async getExerciseById(id: number): Promise<Exercise> {
    const response = await apiClient.get<Exercise>(`/exercises/${id}`);
    return response.data;
  }

  async createExercise(exercise: CreateExerciseDTO): Promise<Exercise> {
    const response = await apiClient.post<Exercise>('/exercises', exercise);
    return response.data;
  }

  async updateExercise(exercise: UpdateExerciseDTO): Promise<Exercise> {
    const { id_exercise, ...data } = exercise;
    const response = await apiClient.put<Exercise>(`/exercises/${id_exercise}`, data);
    return response.data;
  }

  async deleteExercise(id: number): Promise<void> {
    await apiClient.delete(`/exercises/${id}`);
  }
}

