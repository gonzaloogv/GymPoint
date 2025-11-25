import {
  UserRoutine,
  ActiveUserRoutineWithDetails,
  AssignRoutineRequest,
  UserRoutineCounts,
} from '../entities/UserRoutine';

/**
 * UserRoutine Repository Interface
 * Define las operaciones disponibles para UserRoutines
 */
export interface UserRoutineRepository {
  /**
   * Asignar una rutina al usuario actual
   * POST /api/user-routines
   */
  assignRoutine(request: AssignRoutineRequest): Promise<UserRoutine>;

  /**
   * Obtener la rutina activa del usuario (sin ejercicios)
   * GET /api/user-routines/me
   */
  getActiveRoutine(): Promise<UserRoutine>;

  /**
   * Obtener la rutina activa con todos los ejercicios
   * GET /api/user-routines/me/active-routine
   */
  getActiveRoutineWithExercises(): Promise<ActiveUserRoutineWithDetails>;

  /**
   * Finalizar la rutina activa del usuario
   * PUT /api/user-routines/me/end
   */
  endActiveRoutine(): Promise<UserRoutine>;

  /**
   * Obtener contadores de rutinas del usuario
   * GET /api/user-routines/me/counts (si existe endpoint)
   */
  getUserRoutineCounts?(): Promise<UserRoutineCounts>;
}
