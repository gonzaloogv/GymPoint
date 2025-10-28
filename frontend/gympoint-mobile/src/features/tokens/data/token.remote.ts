import { apiClient } from '@shared/http/apiClient';
import { PaginatedTokenLedgerDTO, TokenBalanceDTO, TokenStatsDTO } from './dto/token.api.dto';

export class TokenRemote {
  /**
   * GET /api/users/me/tokens/ledger
   * Obtiene el historial de movimientos de tokens del usuario autenticado
   */
  async getTokenLedger(
    params?: {
      from_date?: string;
      to_date?: string;
      ref_type?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      order?: 'asc' | 'desc';
    }
  ): Promise<PaginatedTokenLedgerDTO> {
    const queryParams = new URLSearchParams();

    if (params?.from_date) queryParams.append('from_date', params.from_date);
    if (params?.to_date) queryParams.append('to_date', params.to_date);
    if (params?.ref_type) queryParams.append('ref_type', params.ref_type);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    const url = `/api/users/me/tokens/ledger${queryString ? `?${queryString}` : ''}`;

    console.log('[TokenRemote] Calling URL:', url);
    const response = await apiClient.get<PaginatedTokenLedgerDTO>(url);
    return response.data;
  }

  /**
   * GET /api/users/me/tokens/balance
   * Obtiene el balance de tokens del usuario autenticado
   */
  async getTokenBalance(): Promise<TokenBalanceDTO> {
    console.log('[TokenRemote] Calling URL: /api/users/me/tokens/balance');
    const response = await apiClient.get<TokenBalanceDTO>('/api/users/me/tokens/balance');
    return response.data;
  }

  /**
   * GET /api/users/me/tokens/stats
   * Obtiene estadísticas de tokens del usuario autenticado (balance, earned, spent)
   */
  async getTokenStats(): Promise<TokenStatsDTO> {
    console.log('[TokenRemote] Calling URL: /api/users/me/tokens/stats');
    const response = await apiClient.get<TokenStatsDTO>('/api/users/me/tokens/stats');
    return response.data;
  }
}
