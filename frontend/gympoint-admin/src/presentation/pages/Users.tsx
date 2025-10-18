import { useState } from 'react';
import {
  useUsers,
  useDeactivateUser,
  useActivateUser,
  useGrantTokens,
  useUpdateSubscription,
} from '../hooks';
import { Card, Loading, Button, Input, Select, Modal, Badge, Table } from '../components';
import { UserCard } from '../components/ui/UserCard'; // Assuming migrated component
import { User } from '@/domain';

export const Users = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [subscription, setSubscription] = useState<'FREE' | 'PREMIUM' | ''>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tokenDelta, setTokenDelta] = useState('');
  const [tokenReason, setTokenReason] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const { data, isLoading } = useUsers({
    page,
    limit: 20,
    search: search || undefined,
    subscription: subscription || undefined,
  });

  const deactivateMutation = useDeactivateUser();
  const activateMutation = useActivateUser();
  const grantTokensMutation = useGrantTokens();
  const updateSubscriptionMutation = useUpdateSubscription();

  const handleGrantTokens = () => {
    if (!selectedUser) return;
    const deltaValue = parseInt(tokenDelta);
    if (isNaN(deltaValue)) {
      alert('La cantidad de tokens debe ser un número válido');
      return;
    }
    grantTokensMutation.mutate(
      { userId: selectedUser.id_user_profile, delta: deltaValue, reason: tokenReason || undefined },
      {
        onSuccess: () => {
          setSelectedUser(null);
          setTokenDelta('');
          setTokenReason('');
          alert('Tokens otorgados exitosamente');
        },
        onError: (error: any) => {
          alert(`Error al otorgar tokens: ${error.response?.data?.error?.message || error.message}`);
        },
      }
    );
  };

  const columns = [
    { key: 'id_user_profile', label: 'ID' },
    { key: 'email', label: 'Email' },
    { key: 'name', label: 'Nombre', render: (user: User) => `${user.name} ${user.lastname}` },
    { key: 'subscription', label: 'Suscripción', render: (user: User) => <Badge variant={user.subscription.toLowerCase() as 'premium' | 'free'}>{user.subscription}</Badge> },
    { key: 'tokens', label: 'Tokens' },
    { key: 'is_active', label: 'Estado', render: (user: User) => <Badge variant={user.is_active ? 'active' : 'inactive'}>{user.is_active ? 'Activo' : 'Inactivo'}</Badge> },
    {
      key: 'actions', label: 'Acciones', render: (user: User) => (
        <div className="flex gap-2">
          {user.is_active ? (
            <Button onClick={() => deactivateMutation.mutate(user.id_account)} variant="danger" size="sm">Desactivar</Button>
          ) : (
            <Button onClick={() => activateMutation.mutate(user.id_account)} variant="success" size="sm">Activar</Button>
          )}
          <Button onClick={() => setSelectedUser(user)} variant="primary" size="sm">Tokens</Button>
          <Button onClick={() => updateSubscriptionMutation.mutate({ userId: user.id_user_profile, subscription: user.subscription === 'FREE' ? 'PREMIUM' : 'FREE' })} variant="secondary" size="sm">Sub</Button>
        </div>
      )
    },
  ];

  if (isLoading) return <Loading fullPage />;

  return (
    <div className="p-6 bg-bg dark:bg-bg-dark min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Gestión de Usuarios</h1>
        <p className="text-sm text-text-muted mt-1">Total: {data?.total || 0} usuarios</p>
      </header>

      <Card as="section" aria-label="Filtros de búsqueda">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            type="text"
            placeholder="Buscar por nombre, apellido o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow"
          />
          <Select
            value={subscription}
            onChange={(e) => setSubscription(e.target.value as 'FREE' | 'PREMIUM' | '')}
            options={[{ value: '', label: 'Todas las Suscripciones' }, { value: 'FREE', label: 'FREE' }, { value: 'PREMIUM', label: 'PREMIUM' }]}
          />
          <div className="flex rounded-lg bg-bg p-1">
            <Button variant={viewMode === 'grid' ? 'primary' : 'secondary'} onClick={() => setViewMode('grid')} size="sm">Cuadrícula</Button>
            <Button variant={viewMode === 'table' ? 'primary' : 'secondary'} onClick={() => setViewMode('table')} size="sm">Tabla</Button>
          </div>
        </div>
      </Card>

      <section className="mt-6" aria-label="Lista de usuarios">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {data?.data?.map((user) => (
              <UserCard
                key={user.id_user_profile}
                user={user}
                onDeactivate={(id) => deactivateMutation.mutate(id)}
                onActivate={(id) => activateMutation.mutate(id)}
                onGrantTokens={() => setSelectedUser(user)}
                onToggleSubscription={(id, sub) => updateSubscriptionMutation.mutate({ userId: id, subscription: sub === 'FREE' ? 'PREMIUM' : 'FREE' })}
              />
            ))}
          </div>
        ) : (
          <Card>
            <Table 
              columns={columns} 
              data={data?.data || []} 
              loading={isLoading}
              caption="Tabla de usuarios del sistema"
              aria-label="Tabla de usuarios"
            />
          </Card>
        )}
      </section>

      {data?.pagination && (
        <nav className="flex justify-center items-center gap-4 mt-6" aria-label="Paginación de usuarios">
          <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Página anterior">Anterior</Button>
          <span aria-current="page">Página {data.pagination.page} de {data.pagination.total_pages}</span>
          <Button onClick={() => setPage((p) => p + 1)} disabled={page >= data.pagination.total_pages} aria-label="Página siguiente">Siguiente</Button>
        </nav>
      )}

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title={`Otorgar Tokens a ${selectedUser?.name}`}>
        <div className="space-y-4">
          <Input
            type="number"
            placeholder="Cantidad de tokens (positivo o negativo)"
            value={tokenDelta}
            onChange={(e) => setTokenDelta(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Razón (opcional)"
            value={tokenReason}
            onChange={(e) => setTokenReason(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <Button onClick={() => setSelectedUser(null)} variant="secondary">Cancelar</Button>
          <Button onClick={handleGrantTokens} variant="primary" disabled={grantTokensMutation.isPending}>Otorgar</Button>
        </div>
      </Modal>
    </div>
  );
};
