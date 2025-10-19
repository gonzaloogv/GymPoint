// src/features/progress/data/TokenHistoryRepositoryImpl.ts
import { TokenMovement, TokenSummary } from '../domain/entities/TokenMovement';
import { TokenHistoryRepository } from '../domain/repositories/TokenHistoryRepository';
import { TokenHistoryLocal } from './datasources/TokenHistoryLocal';

export class TokenHistoryRepositoryImpl implements TokenHistoryRepository {
  constructor(private local: TokenHistoryLocal) {}

  async getMovements(userId: string): Promise<TokenMovement[]> {
    return this.local.getMovements(userId);
  }

  async getSummary(userId: string): Promise<TokenSummary> {
    return this.local.getSummary(userId);
  }
}
