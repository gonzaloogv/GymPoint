import { Exercise, CreateExerciseDTO, UpdateExerciseDTO } from '../entities/RoutineTemplate';

export interface ExerciseRepository {
  getAllExercises(): Promise<Exercise[]>;
  getExerciseById(id: number): Promise<Exercise>;
  createExercise(exercise: CreateExerciseDTO): Promise<Exercise>;
  updateExercise(exercise: UpdateExerciseDTO): Promise<Exercise>;
  deleteExercise(id: number): Promise<void>;
}

