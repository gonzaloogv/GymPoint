// Estructura de un entry del ledger según la API
export interface TokenLedgerEntryDTO {
  id_ledger: number;
  id_user_profile: number;
  delta: number;
  balance_after: number;
  reason: string;
  ref_type?: string | null;
  ref_id?: number | null;
  metadata?: Record<string, any> | null;
  created_at: string;
}

// Respuesta paginada del endpoint GET /api/users/:userId/tokens/ledger
export interface PaginatedTokenLedgerDTO {
  items: TokenLedgerEntryDTO[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Respuesta del endpoint GET /api/users/:userId/tokens/balance
export interface TokenBalanceDTO {
  id_user_profile: number;
  balance: number;
}

// Respuesta del endpoint GET /api/users/me/tokens/stats
export interface TokenStatsDTO {
  userId: number;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  totalClaimed: number;
}
