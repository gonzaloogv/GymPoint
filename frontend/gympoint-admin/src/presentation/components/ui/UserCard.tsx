import { User } from '@/domain';
import { Card, Button, Badge } from './index';

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
    <Card>
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border dark:border-border-dark">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-text font-bold text-lg">
          {user.name.charAt(0)}
          {user.lastname.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-text dark:text-text-dark">
            {user.name} {user.lastname}
          </h3>
          <p className="text-sm text-text-muted">{user.email}</p>
        </div>
        <Badge variant={user.is_active ? 'active' : 'inactive'}>
          {user.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-text dark:text-text-dark">
        <div className="flex flex-col">
          <span className="text-xs text-text-muted uppercase">Suscripción</span>
          <Badge variant={user.subscription.toLowerCase() as 'premium' | 'free'}>
            {user.subscription}
          </Badge>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-text-muted uppercase">Tokens</span>
          <span className="font-semibold">{user.tokens}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-text-muted uppercase">Proveedor</span>
          <span className="font-semibold">{user.auth_provider}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-text-muted uppercase">Último Acceso</span>
          <span className="font-semibold">
            {user.last_login ? new Date(user.last_login).toLocaleDateString('es-ES') : 'Nunca'}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {user.is_active ? (
          <Button onClick={() => onDeactivate(user.id_account)} variant="danger" size="sm">
            Desactivar
          </Button>
        ) : (
          <Button onClick={() => onActivate(user.id_account)} variant="success" size="sm">
            Activar
          </Button>
        )}
        <Button onClick={() => onGrantTokens(user.id_user_profile)} variant="primary" size="sm">
          Otorgar Tokens
        </Button>
        <Button
          onClick={() => onToggleSubscription(user.id_user_profile, user.subscription)}
          variant="secondary"
          size="sm"
        >
          {user.subscription === 'FREE' ? '→ Premium' : '→ Gratis'}
        </Button>
      </div>
    </Card>
  );
};
