import { User } from '@/domain';

interface UserCardProps {
  user: User;
  onDeactivate: (accountId: number) => void;
  onActivate: (accountId: number) => void;
  onGrantTokens: (userId: number) => void;
  onToggleSubscription: (userId: number, currentSubscription: 'FREE' | 'PREMIUM') => void;
}

export const UserCard = ({
  user,
  onDeactivate,
  onActivate,
  onGrantTokens,
  onToggleSubscription,
}: UserCardProps) => {
  return (
    <div className="user-card">
      <div className="user-card-header">
        <div className="user-avatar">
          {user.name.charAt(0)}
          {user.lastname.charAt(0)}
        </div>
        <div className="user-info">
          <h3 className="user-name">
            {user.name} {user.lastname}
          </h3>
          <p className="user-email">{user.email}</p>
        </div>
        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
          {user.is_active ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="user-card-body">
        <div className="user-stat">
          <span className="stat-label">Suscripción</span>
          <span className={`subscription-badge ${user.subscription.toLowerCase()}`}>
            {user.subscription}
          </span>
        </div>
        <div className="user-stat">
          <span className="stat-label">Tokens</span>
          <span className="stat-value">{user.tokens}</span>
        </div>
        <div className="user-stat">
          <span className="stat-label">Proveedor</span>
          <span className="stat-value">{user.auth_provider}</span>
        </div>
        <div className="user-stat">
          <span className="stat-label">Último Acceso</span>
          <span className="stat-value">
            {user.last_login ? new Date(user.last_login).toLocaleDateString('es-ES') : 'Nunca'}
          </span>
        </div>
      </div>

      <div className="user-card-actions">
        {user.is_active ? (
          <button onClick={() => onDeactivate(user.id_account)} className="btn-danger-sm">
            Desactivar
          </button>
        ) : (
          <button onClick={() => onActivate(user.id_account)} className="btn-success-sm">
            Activar
          </button>
        )}
        <button onClick={() => onGrantTokens(user.id_user_profile)} className="btn-primary-sm">
          Otorgar Tokens
        </button>
        <button
          onClick={() => onToggleSubscription(user.id_user_profile, user.subscription)}
          className="btn-secondary-sm"
        >
          {user.subscription === 'FREE' ? '→ Premium' : '→ Gratis'}
        </button>
      </div>
    </div>
  );
};
