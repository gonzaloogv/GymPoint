import {
  WorkoutSession,
  WorkoutSet,
  StartWorkoutSessionRequest,
  RegisterWorkoutSetRequest,
  UpdateWorkoutSetRequest,
  CompleteWorkoutSessionRequest,
  WorkoutStats,
} from '../entities/WorkoutSession';

/**
 * Workout Repository Interface
 * Define el contrato para acceso a datos de workout
 */
export interface WorkoutRepository {
  // Session operations
  startSession(request: StartWorkoutSessionRequest): Promise<WorkoutSession>;
  getActiveSession(): Promise<WorkoutSession | null>;
  getMySessions(params?: {
    status?: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    page?: number;
    limit?: number;
  }): Promise<WorkoutSession[]>;
  getSessionById(id: number): Promise<WorkoutSession>;
  updateSession(id: number, notes: string): Promise<WorkoutSession>;
  completeSession(id: number, request?: CompleteWorkoutSessionRequest): Promise<WorkoutSession>;
  cancelSession(id: number): Promise<WorkoutSession>;
  getStats(params?: { start_date?: string; end_date?: string }): Promise<WorkoutStats>;

  // Set operations
  getSessionSets(sessionId: number, exerciseId?: number): Promise<WorkoutSet[]>;
  registerSet(sessionId: number, request: RegisterWorkoutSetRequest): Promise<WorkoutSet>;
  updateSet(setId: number, request: UpdateWorkoutSetRequest): Promise<WorkoutSet>;
  deleteSet(setId: number): Promise<void>;
}
