import { useState } from 'react';
import {
  useUsers,
  useDeactivateUser,
  useActivateUser,
  useGrantTokens,
  useUpdateSubscription,
} from '../hooks';
import { Card, Loading, UserCard } from '../components';

export const Users = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [subscription, setSubscription] = useState<'FREE' | 'PREMIUM' | ''>('');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
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

  const handleGrantTokens = (userId: number) => {
    console.log('handleGrantTokens called with userId:', userId);

    if (!userId) {
      alert('Error: ID de usuario no válido');
      return;
    }

    if (!tokenDelta) {
      alert('Por favor ingresa la cantidad de tokens');
      return;
    }

    const deltaValue = parseInt(tokenDelta);
    if (isNaN(deltaValue)) {
      alert('La cantidad de tokens debe ser un número válido');
      return;
    }

    console.log('Sending grant tokens request:', { userId, delta: deltaValue, reason: tokenReason });

    grantTokensMutation.mutate(
      {
        userId,
        delta: deltaValue,
        reason: tokenReason || undefined,
      },
      {
        onSuccess: (data) => {
          console.log('Tokens granted successfully:', data);
          setSelectedUser(null);
          setTokenDelta('');
          setTokenReason('');
          alert('Tokens otorgados exitosamente');
        },
        onError: (error: any) => {
          console.error('Error al otorgar tokens:', error);
          console.error('Error response:', error.response);
          const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido';
          alert(`Error al otorgar tokens: ${errorMessage}`);
        },
      }
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="users-page">
      <h2>Gestión de Usuarios</h2>

      <Card>
        <div className="filters">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <select
            value={subscription}
            onChange={(e) => setSubscription(e.target.value as 'FREE' | 'PREMIUM' | '')}
            className="filter-select"
          >
            <option value="">Todas las Suscripciones</option>
            <option value="FREE">FREE</option>
            <option value="PREMIUM">PREMIUM</option>
          </select>

          <div className="view-toggle">
            <button
              onClick={() => setViewMode('grid')}
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            >
              Cuadrícula
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            >
              Tabla
            </button>
          </div>
        </div>
      </Card>

      {viewMode === 'grid' ? (
        <div className="users-grid">
          {data?.data?.map((user) => (
            <UserCard
              key={user.id_user_profile}
              user={user}
              onDeactivate={(id) => deactivateMutation.mutate(id)}
              onActivate={(id) => activateMutation.mutate(id)}
              onGrantTokens={(id) => setSelectedUser(id)}
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
        <Card title="Lista de Usuarios">
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Nombre</th>
                <th>Suscripción</th>
                <th>Tokens</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((user) => (
                <tr key={user.id_user_profile}>
                  <td>{user.id_user_profile}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.name} {user.lastname}
                  </td>
                  <td>
                    <span className={`badge ${user.subscription.toLowerCase()}`}>
                      {user.subscription}
                    </span>
                  </td>
                  <td>{user.tokens}</td>
                  <td>
                    <span className={`status ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {user.is_active ? (
                        <button
                          onClick={() => deactivateMutation.mutate(user.id_account)}
                          className="btn-danger"
                        >
                          Desactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => activateMutation.mutate(user.id_account)}
                          className="btn-success"
                        >
                          Activar
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedUser(user.id_user_profile)}
                        className="btn-primary"
                      >
                        Otorgar Tokens
                      </button>

                      <button
                        onClick={() =>
                          updateSubscriptionMutation.mutate({
                            userId: user.id_user_profile,
                            subscription: user.subscription === 'FREE' ? 'PREMIUM' : 'FREE',
                          })
                        }
                        className="btn-secondary"
                      >
                        Cambiar Sub
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data?.pagination && (
          <div className="pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-pagination"
            >
              Anterior
            </button>
            <span>
              Página {data.pagination.page} de {data.pagination.total_pages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.pagination.total_pages}
              className="btn-pagination"
            >
              Siguiente
            </button>
          </div>
        )}
      </Card>
      )}

      {data?.pagination && viewMode === 'grid' && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-pagination"
          >
            Anterior
          </button>
          <span>
            Página {data.pagination.page} de {data.pagination.total_pages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.pagination.total_pages}
            className="btn-pagination"
          >
            Siguiente
          </button>
        </div>
      )}

      {selectedUser && (
        <div className="modal">
          <div className="modal-content">
            <h3>Otorgar Tokens al Usuario #{selectedUser}</h3>
            <input
              type="number"
              placeholder="Cantidad de tokens (positivo o negativo)"
              value={tokenDelta}
              onChange={(e) => setTokenDelta(e.target.value)}
            />
            <input
              type="text"
              placeholder="Razón (opcional)"
              value={tokenReason}
              onChange={(e) => setTokenReason(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={() => handleGrantTokens(selectedUser)} className="btn-primary">
                Otorgar
              </button>
              <button onClick={() => setSelectedUser(null)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
