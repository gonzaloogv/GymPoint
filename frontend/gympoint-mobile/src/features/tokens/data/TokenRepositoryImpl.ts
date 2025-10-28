import { TokenRepository } from '../domain/repositories/TokenRepository';
import { TokenHistory, TokenTransactionFilters, TokenBalance } from '../domain/entities/TokenTransaction';
import { TokenRemote } from './token.remote';
import { mapPaginatedTokenLedgerDTOToHistory } from './mappers/token.mapper';
import { logError, parseBackendError } from '@shared/utils/errorParser';

export class TokenRepositoryImpl implements TokenRepository {
  constructor(private remote: TokenRemote) {}

  async getTokenHistory(filters?: TokenTransactionFilters): Promise<TokenHistory> {
    try {
      console.log('[TokenRepository] Fetching token history');

      const params: any = {
        page: filters?.page || 1,
        limit: filters?.limit || 50,
        sortBy: 'created_at',
        order: 'desc' as const,
      };

      if (filters?.fromDate) {
        params.from_date = filters.fromDate.toISOString();
      }
      if (filters?.toDate) {
        params.to_date = filters.toDate.toISOString();
      }
      if (filters?.refType) {
        params.ref_type = filters.refType;
      }

      const dto = await this.remote.getTokenLedger(params);
      console.log(`[TokenRepository] Received ${dto.items.length} transactions`);

      const history = mapPaginatedTokenLedgerDTOToHistory(dto);

      // Filtrar por tipo si se especificó
      if (filters?.type && filters.type !== 'all') {
        history.transactions = history.transactions.filter(tx => tx.type === filters.type);
      }

      return history;
    } catch (error) {
      logError('TokenRepository.getTokenHistory', error);
      const errorMessage = parseBackendError(error);
      console.error(`[TokenRepository] Error: ${errorMessage}`);

      // Retornar historial vacío en caso de error
      return {
        transactions: [],
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
      };
    }
  }

  async getTokenBalance(): Promise<TokenBalance> {
    try {
      console.log('[TokenRepository] Fetching token balance');

      // Usar el endpoint /stats que ya calcula earned y spent en el backend
      const stats = await this.remote.getTokenStats();

      return {
        available: stats.balance,
        earned: stats.totalEarned,
        spent: stats.totalSpent,
      };
    } catch (error) {
      logError('TokenRepository.getTokenBalance', error);
      const errorMessage = parseBackendError(error);
      console.error(`[TokenRepository] Error: ${errorMessage}`);

      return {
        available: 0,
        earned: 0,
        spent: 0,
      };
    }
  }
}
