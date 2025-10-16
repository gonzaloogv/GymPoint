// src/features/progress/domain/usecases/GetTokenHistory.ts
import { TokenMovement, TokenSummary } from '../entities/TokenMovement';
import { TokenHistoryRepository } from '../repositories/TokenHistoryRepository';

export class GetTokenHistory {
  constructor(private repository: TokenHistoryRepository) {}

  async getMovements(userId: string): Promise<TokenMovement[]> {
    return this.repository.getMovements(userId);
  }

  async getSummary(userId: string): Promise<TokenSummary> {
    return this.repository.getSummary(userId);
  }
}
