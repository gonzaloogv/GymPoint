import { Routine, CreateRoutineRequest, UpdateRoutineRequest } from '../entities/Routine';

/**
 * Routine Repository Interface
 * Define las operaciones disponibles para Routines
 * Sincronizado con la API del backend
 */
export interface RoutineRepository {
  /**
   * Crear una nueva rutina
   * POST /api/routines
   */
  create(request: CreateRoutineRequest): Promise<Routine>;

  /**
   * Obtener todas las rutinas del usuario
   * GET /api/routines/me
   */
  getMyRoutines(): Promise<Routine[]>;

  /**
   * Obtener rutinas plantilla (templates)
   * GET /api/routines/templates
   */
  getTemplates(): Promise<Routine[]>;

  /**
   * Obtener una rutina por ID
   * GET /api/routines/:id
   */
  getById(id: number): Promise<Routine>;

  /**
   * Actualizar una rutina
   * PUT /api/routines/:id
   */
  update(id: number, request: UpdateRoutineRequest): Promise<Routine>;

  /**
   * Eliminar una rutina
   * DELETE /api/routines/:id
   */
  delete(id: number): Promise<void>;

  /**
   * Clonar una rutina
   * POST /api/routines/:id/clone
   */
  clone(id: number): Promise<Routine>;

  /**
   * Obtener contadores de rutinas del usuario
   * GET /api/routines/me/count
   */
  getMyRoutinesCounts(): Promise<{
    total_owned: number;
    imported_count: number;
    created_count: number;
  }>;
}
