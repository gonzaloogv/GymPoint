import { Reward } from '@/domain';

interface RewardCardProps {
  reward: Reward;
  onEdit: (reward: Reward) => void;
  onDelete: (id: number, name: string) => void;
  isDeleting?: boolean;
}

export const RewardCard = ({ reward, onEdit, onDelete, isDeleting }: RewardCardProps) => {
  const isActive = reward.available && reward.stock > 0;
  const isExpired = new Date(reward.finish_date) < new Date();
  
  const getStatusBadge = () => {
    if (isExpired) {
      return <span className="badge badge-expired">⏰ Expirada</span>;
    }
    if (!reward.available) {
      return <span className="badge badge-inactive">🚫 No Disponible</span>;
    }
    if (reward.stock === 0) {
      return <span className="badge badge-out-of-stock">📦 Sin Stock</span>;
    }
    return <span className="badge badge-active">✅ Activa</span>;
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
    <div className={`reward-card ${!isActive ? 'inactive' : ''}`}>
      <div className="reward-header">
        <h3>{reward.name}</h3>
        {getStatusBadge()}
      </div>

      <div className="reward-body">
        <p className="reward-description">{reward.description}</p>

        <div className="reward-details">
          <div className="detail-item">
            <span className="detail-label">💰 Costo:</span>
            <span className="detail-value">{reward.cost_tokens} tokens</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">📦 Stock:</span>
            <span className="detail-value">{reward.stock} unidades</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">📦 Tipo:</span>
            <span className="detail-value">{reward.type.replace(/_/g, ' ')}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">📅 Inicio:</span>
            <span className="detail-value">{formatDate(reward.start_date)}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">📅 Fin:</span>
            <span className="detail-value">{formatDate(reward.finish_date)}</span>
          </div>
        </div>
      </div>

      <div className="reward-actions">
        <button
          onClick={() => onEdit(reward)}
          className="btn-edit"
          disabled={isDeleting}
        >
          ✏️ Editar
        </button>
        <button
          onClick={() => onDelete(reward.id_reward, reward.name)}
          className="btn-danger-sm"
          disabled={isDeleting}
        >
          {isDeleting ? '⏳' : '🗑️'} Eliminar
        </button>
      </div>
    </div>
  );
};




