import { Reward } from '@/domain';
import { Card, Button, Badge } from './index';

interface RewardCardProps {
  reward: Reward;
  onEdit: (reward: Reward) => void;
  onDelete: (id: number, name: string) => void;
  isDeleting?: boolean;
}

export const RewardCard = ({ reward, onEdit, onDelete, isDeleting }: RewardCardProps) => {
  const isExpired = reward.finish_date ? new Date(reward.finish_date) < new Date() : false;

  const getStatusBadge = () => {
    if (isExpired) {
      return <Badge variant="warning">⏰ Expirada</Badge>;
    }
    if (!reward.available) {
      return <Badge variant="inactive">🚫 No Disponible</Badge>;
    }
    if (reward.stock === 0) {
      return <Badge variant="inactive">📦 Sin Stock</Badge>;
    }
    return <Badge variant="active">✅ Activa</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className={`flex flex-col ${!reward.available || reward.stock === 0 ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-text dark:text-text-dark flex-1 mr-2">{reward.name}</h3>
        {getStatusBadge()}
      </div>

      <div className="flex-grow">
        <p className="text-sm text-text-muted mb-4">{reward.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-4 border-t border-border dark:border-border-dark pt-4 text-text dark:text-text-dark">
          <div className="flex flex-col">
            <span className="text-xs text-text-muted uppercase">💰 Costo:</span>
            <span className="font-semibold">{reward.cost_tokens} tokens</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-text-muted uppercase">📦 Stock:</span>
            <span className="font-semibold">{reward.stock} unidades</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-text-muted uppercase">🏷️ Tipo:</span>
            <span className="font-semibold">{reward.type ? reward.type.replace(/_/g, ' ') : 'N/A'}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-text-muted uppercase">📅 Inicio:</span>
            <span className="font-semibold">{reward.start_date ? formatDate(reward.start_date) : 'N/A'}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-text-muted uppercase">📅 Fin:</span>
            <span className="font-semibold">{reward.finish_date ? formatDate(reward.finish_date) : 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        <Button
          onClick={() => onEdit(reward)}
          variant="primary"
          size="sm"
          disabled={isDeleting}
          className="flex-1"
        >
          ✏️ Editar
        </Button>
        <Button
          onClick={() => onDelete(reward.id_reward, reward.name)}
          variant="danger"
          size="sm"
          disabled={isDeleting}
          className="flex-1"
        >
          {isDeleting ? '⏳' : '🗑️'} Eliminar
        </Button>
      </div>
    </Card>
  );
};
