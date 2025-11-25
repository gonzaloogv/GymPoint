import { useEffect, useState } from 'react';
import {
  useUsers,
  useDeactivateUser,
  useActivateUser,
  useGrantTokens,
  useUpdateSubscription,
} from '../hooks';
import { Card, Loading, Button, Input, Select, Modal, Badge, Table } from '../components';
import { Column } from '../components/ui/Table';
import { UserCard } from '../components/ui/UserCard';
import { User } from '@/domain';

export const Users = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [subscription, setSubscription] = useState<'FREE' | 'PREMIUM' | ''>('');
  const [status, setStatus] = useState<'active' | 'revoked' | ''>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tokenDelta, setTokenDelta] = useState('');
  const [tokenReason, setTokenReason] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const applySearch = () => {
    setAppliedSearch(searchInput.trim());
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [appliedSearch, subscription, status]);

  const { data, isLoading, isFetching } = useUsers({
    page,
    limit: 20,
    search: appliedSearch || undefined,
    subscription: subscription || undefined,
    status: status || undefined,
  });

  const deactivateMutation = useDeactivateUser();
  const activateMutation = useActivateUser();
  const grantTokensMutation = useGrantTokens();
  const updateSubscriptionMutation = useUpdateSubscription();

  const handleGrantTokens = () => {
    if (!selectedUser) return;
    const deltaValue = parseInt(tokenDelta, 10);
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

  const columns: Column<User>[] = [
    { key: 'id_user_profile', label: 'ID' },
    { key: 'email', label: 'Email' },
    { key: 'name', label: 'Nombre', render: (user: User) => `${user.name} ${user.lastname}` },
    {
      key: 'subscription',
      label: 'Suscripción',
      render: (user: User) => <Badge variant={user.subscription.toLowerCase() as 'premium' | 'free'}>{user.subscription}</Badge>,
    },
    { key: 'tokens', label: 'Tokens' },
    {
      key: 'is_active',
      label: 'Estado',
      render: (user: User) => <Badge variant={user.is_active ? 'active' : 'inactive'}>{user.is_active ? 'Activo' : 'Inactivo'}</Badge>,
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (user: User) => (
        <div className="flex gap-2">
          {user.is_active ? (
            <Button onClick={() => deactivateMutation.mutate(user.id_account)} variant="danger" size="sm">
              Desactivar
            </Button>
          ) : (
            <Button onClick={() => activateMutation.mutate(user.id_account)} variant="success" size="sm">
              Activar
            </Button>
          )}
          <Button onClick={() => setSelectedUser(user)} variant="primary" size="sm">
            Tokens
          </Button>
          <Button
            onClick={() =>
              updateSubscriptionMutation.mutate({
                userId: user.id_user_profile,
                subscription: user.subscription === 'FREE' ? 'PREMIUM' : 'FREE',
              })
            }
            variant="secondary"
            size="sm"
          >
            Sub
          </Button>
        </div>
      ),
    },
  ];

  if (!data && isLoading) return <Loading fullPage />;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Gestión de Usuarios</h1>
        <p className="text-sm text-text-muted mt-1">Total: {data?.pagination.total || 0} usuarios</p>
        {isFetching && <p className="text-xs text-text-muted mt-1">Actualizando resultados...</p>}
      </header>

      <Card as="section" aria-label="Filtros de búsqueda">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            type="text"
            placeholder="Buscar por ID, nombre, apellido o email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applySearch();
              }
            }}
            className="flex-grow"
          />
          <Button onClick={applySearch} variant="primary">
            Buscar
          </Button>
          <Select
            value={subscription}
            onChange={(e) => setSubscription(e.target.value as 'FREE' | 'PREMIUM' | '')}
            options={[
              { value: '', label: 'Todas las Suscripciones' },
              { value: 'FREE', label: 'FREE' },
              { value: 'PREMIUM', label: 'PREMIUM' },
            ]}
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'revoked' | '')}
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'active', label: 'Activos' },
              { value: 'revoked', label: 'Revocados' },
            ]}
          />
          <div className="relative inline-flex gap-1 rounded-lg bg-bg p-1 dark:bg-bg-dark shrink-0">
            <div
              className={`absolute inset-y-1 rounded-md bg-primary shadow-sm transition-all duration-300 ease-in-out ${
                viewMode === 'grid' ? 'left-1 w-[calc(50%-4px)]' : 'left-[calc(50%+2px)] w-[calc(50%-4px)]'
              }`}
            />

            <button
              onClick={() => setViewMode('grid')}
              className={`relative z-10 w-16 rounded-md px-2 py-1.5 text-xs font-medium transition-colors duration-200 sm:w-24 sm:px-4 sm:py-2 sm:text-sm ${
                viewMode === 'grid' ? 'text-white' : 'text-text hover:text-primary dark:text-text-dark dark:hover:text-primary'
              }`}
            >
              <span className="sm:hidden">Grid</span>
              <span className="hidden sm:inline">Cuadrícula</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`relative z-10 w-16 rounded-md px-2 py-1.5 text-xs font-medium transition-colors duration-200 sm:w-24 sm:px-4 sm:py-2 sm:text-sm ${
                viewMode === 'table' ? 'text-white' : 'text-text hover:text-primary dark:text-text-dark dark:hover:text-primary'
              }`}
            >
              Tabla
            </button>
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
                onToggleSubscription={(id, sub) =>
                  updateSubscriptionMutation.mutate({
                    userId: id,
                    subscription: sub === 'FREE' ? 'PREMIUM' : 'FREE',
                  })
                }
              />
            ))}
          </div>
        ) : (
          <Card>
            <Table
              columns={columns}
              data={data?.data || []}
              rowKey="id_user_profile"
              loading={isLoading}
              caption="Tabla de usuarios del sistema"
              aria-label="Tabla de usuarios"
            />
          </Card>
        )}
      </section>

      {data?.pagination && (
        <nav className="flex justify-center items-center gap-4 mt-6" aria-label="Paginación de usuarios">
          <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Página anterior">
            Anterior
          </Button>
          <span aria-current="page">
            Página {data.pagination.page} de {data.pagination.total_pages}
          </span>
          <Button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.pagination.total_pages}
            aria-label="Página siguiente"
          >
            Siguiente
          </Button>
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
          <Button onClick={() => setSelectedUser(null)} variant="secondary">
            Cancelar
          </Button>
          <Button onClick={handleGrantTokens} variant="primary" disabled={grantTokensMutation.isPending}>
            Otorgar
          </Button>
        </div>
      </Modal>
    </div>
  );
};
