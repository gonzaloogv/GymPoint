import { Progress } from '../entities/Progress';

export interface ProgressRepository {
  getProgress(userId: string): Promise<Progress>;
}