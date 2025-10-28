import { TokenRepository } from '../repositories/TokenRepository';
import { TokenHistory, TokenTransactionFilters } from '../entities/TokenTransaction';

export class GetTokenHistory {
  constructor(private repository: TokenRepository) {}

  async execute(filters?: TokenTransactionFilters): Promise<TokenHistory> {
    return this.repository.getTokenHistory(filters);
  }
}
