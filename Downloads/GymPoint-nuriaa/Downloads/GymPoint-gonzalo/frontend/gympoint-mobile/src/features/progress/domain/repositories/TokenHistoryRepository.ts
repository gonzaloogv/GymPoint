// src/features/progress/domain/repositories/TokenHistoryRepository.ts
import { TokenMovement, TokenSummary } from '../entities/TokenMovement';

export interface TokenHistoryRepository {
  getMovements(userId: string): Promise<TokenMovement[]>;
  getSummary(userId: string): Promise<TokenSummary>;
}
