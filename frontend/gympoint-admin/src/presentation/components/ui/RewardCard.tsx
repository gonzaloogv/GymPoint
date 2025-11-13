import React from 'react';

import { Reward } from '@/domain';
import { Card, Button, Badge } from './index';
import { translateRewardType } from '@/utils/translations';

const formatDate = (date?: string | null) => {
  if (!date) {
    return 'N/A';
  }

  return new Date(date).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getEffectSummary = (reward: Reward) => {
  if (!reward.effect_value) {
    return null;
  }

  switch (reward.reward_type) {
    case 'token_multiplier':
      return `Multiplica x${reward.effect_value} durante ${reward.duration_days ?? 7} días`;
    case 'streak_saver':
      return `Agrega ${reward.effect_value} salvavidas a la racha`;
    case 'pase_gratis':
      return `${reward.effect_value} días de premium`;
    case 'descuento':
      return `${reward.effect_value}% de descuento`;
    default:
      return `Valor del efecto: ${reward.effect_value}`;
  }
};

interface RewardCardProps {
  reward: Reward;
  onEdit: (reward: Reward) => void;
  onDelete: (id: number, name: string) => void;
  isDeleting?: boolean;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  const isExpired = reward.finish_date ? new Date(reward.finish_date) < new Date() : false;
  const hasStock = reward.is_unlimited || (reward.stock ?? 0) > 0;

  const stockLabel = reward.is_unlimited ? 'Ilimitado' : `${reward.stock ?? 0} unidades`;
  const cooldownLabel = reward.cooldown_days ? `${reward.cooldown_days} días` : 'Sin cooldown';
  const stackLabel = reward.is_stackable ? `Acumulable x${reward.max_stack ?? 1}` : 'No acumulable';
  const premiumLabel = reward.requires_premium ? 'Solo usuarios premium' : 'Disponible para todos';
  const effectSummary = getEffectSummary(reward);

  const getStatusBadge = () => {
    if (isExpired) {
      return <Badge variant="warning">Expirada</Badge>;
    }
    if (!reward.available || !hasStock) {
      return <Badge variant="inactive">No disponible</Badge>;
    }
    return <Badge variant="active">Activa</Badge>;
  };

  const details = [
    { label: 'Costo', value: `${reward.cost_tokens} tokens` },
    { label: 'Stock', value: stockLabel },
    { label: 'Tipo', value: translateRewardType(reward.reward_type) },
    { label: 'Cooldown', value: cooldownLabel },
    { label: 'Inventario', value: stackLabel },
    { label: 'Premium', value: premiumLabel },
    { label: 'Inicio', value: formatDate(reward.start_date) },
    { label: 'Fin', value: formatDate(reward.finish_date) },
  ];

  return (
    <Card className={`flex flex-col ${!reward.available || !hasStock ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-text dark:text-text-dark flex-1 mr-2">{reward.name}</h3>
        {getStatusBadge()}
      </div>

      <div className="flex-grow">
        {reward.description && <p className="text-sm text-text-muted mb-4">{reward.description}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 border-t border-border dark:border-border-dark pt-4 text-text dark:text-text-dark">
          {details.map(({ label, value }) => (
            <div key={label} className="flex flex-col">
              <span className="text-xs text-text-muted uppercase">{label}</span>
              <span className="font-semibold">{value}</span>
            </div>
          ))}
        </div>

        {effectSummary && (
          <div className="rounded-2xl bg-muted/40 dark:bg-muted-dark/30 px-4 py-3 text-sm text-text dark:text-text-dark">
            {effectSummary}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-auto">
        <Button
          onClick={() => onEdit(reward)}
          variant="primary"
          size="sm"
          disabled={isDeleting}
          className="flex-1"
        >
          Editar
        </Button>
        <Button
          onClick={() => onDelete(reward.id_reward, reward.name)}
          variant="danger"
          size="sm"
          disabled={isDeleting}
          className="flex-1"
        >
          {isDeleting ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </div>
    </Card>
  );
};


