import { TokenTransaction, TokenHistory, TokenTransactionType } from '../../domain/entities/TokenTransaction';
import { TokenLedgerEntryDTO, PaginatedTokenLedgerDTO } from '../dto/token.api.dto';

// Mapea la razón del backend a un título human-readable
const getTransactionTitle = (reason: string, refType?: string | null): string => {
  const reasonMap: Record<string, string> = {
    'ACHIEVEMENT_UNLOCKED': 'Logro desbloqueado',
    'WORKOUT_COMPLETED': 'Entrenamiento completado',
    'CHALLENGE_COMPLETED': 'Desafío completado',
    'STREAK_MILESTONE': 'Racha alcanzada',
    'REWARD_CLAIMED': 'Recompensa canjeada',
    'REWARD_PURCHASED': 'Recompensa comprada',
    'ADMIN_ADJUSTMENT': 'Ajuste manual',
    'REFUND': 'Reembolso',
    'DAILY_BONUS': 'Bonus diario',
  };

  return reasonMap[reason] || reason.replace(/_/g, ' ').toLowerCase();
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const mapTokenLedgerEntryDTOToEntity = (dto: TokenLedgerEntryDTO): TokenTransaction => {
  const isEarned = dto.delta > 0;
  const type: TokenTransactionType = isEarned ? 'earned' : 'spent';
  const amount = Math.abs(dto.delta);

  return {
    id: String(dto.id_ledger),
    userId: dto.id_user_profile,
    delta: dto.delta,
    balanceAfter: dto.balance_after,
    reason: dto.reason,
    refType: dto.ref_type,
    refId: dto.ref_id,
    metadata: dto.metadata,
    createdAt: dto.created_at,

    // Computed fields
    type,
    amount,
    title: getTransactionTitle(dto.reason, dto.ref_type),
    date: formatDate(dto.created_at),
  };
};

export const mapPaginatedTokenLedgerDTOToHistory = (dto: PaginatedTokenLedgerDTO): TokenHistory => {
  return {
    transactions: dto.items.map(mapTokenLedgerEntryDTOToEntity),
    page: dto.page,
    limit: dto.limit,
    total: dto.total,
    totalPages: dto.totalPages,
  };
};
