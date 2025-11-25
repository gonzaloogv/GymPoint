import { TokenHistory, TokenTransactionFilters, TokenBalance } from '../entities/TokenTransaction';

export interface TokenRepository {
  getTokenHistory(filters?: TokenTransactionFilters): Promise<TokenHistory>;
  getTokenBalance(): Promise<TokenBalance>;
}
