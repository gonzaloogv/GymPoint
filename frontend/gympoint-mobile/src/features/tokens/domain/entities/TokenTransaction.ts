export type TokenTransactionId = string;
export type TokenTransactionType = 'earned' | 'spent';

export interface TokenTransaction {
  id: TokenTransactionId;
  userId: number;
  delta: number; // positive = earned, negative = spent
  balanceAfter: number;
  reason: string;
  refType?: string | null;
  refId?: number | null;
  metadata?: Record<string, any> | null;
  createdAt: string;

  // Computed fields
  type: TokenTransactionType;
  amount: number; // absolute value of delta
  title: string; // human-readable description
  date: string; // formatted date
}

export interface TokenTransactionFilters {
  type?: 'all' | TokenTransactionType;
  fromDate?: Date;
  toDate?: Date;
  refType?: string;
  page?: number;
  limit?: number;
}

export interface TokenHistory {
  transactions: TokenTransaction[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TokenBalance {
  available: number;
  earned: number;
  spent: number;
}
