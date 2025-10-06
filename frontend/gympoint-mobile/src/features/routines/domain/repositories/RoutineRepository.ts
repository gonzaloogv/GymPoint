import { Routine } from '../entities/Routine';
import { RoutineSession } from '../entities/RoutineHistory';

export interface RoutineRepository {
  getAll(): Promise<Routine[]>;
  getById(id: string): Promise<Routine>;
  getHistory(routineId: string): Promise<RoutineSession[]>;
  saveSession(session: RoutineSession): Promise<void>;
}
