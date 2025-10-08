import { useState } from 'react';
import { useTransactions } from '../hooks';
import { Card, Loading } from '../components';

export const Transactions = () => {
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState('');

  const { data, isLoading } = useTransactions({
    page,
    limit: 50,
    user_id: userId ? parseInt(userId) : undefined,
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="transactions-page">
      <h2>Transacciones de Tokens</h2>

      <Card>
        <div className="filters">
          <input
            type="number"
            placeholder="Filtrar por ID de Usuario..."
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="search-input"
          />
        </div>
      </Card>

      <Card title="Historial de Transacciones">
        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Delta</th>
                <th>Balance Final</th>
                <th>Razón</th>
                <th>Referencia</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((transaction) => (
                <tr key={transaction.id_ledger}>
                  <td>{transaction.id_ledger}</td>
                  <td>
                    {transaction.user ? (
                      <>
                        {transaction.user.name}
                        <br />
                        <small>{transaction.user.email}</small>
                      </>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    <span className={`delta ${transaction.delta > 0 ? 'positive' : 'negative'}`}>
                      {transaction.delta > 0 ? '+' : ''}
                      {transaction.delta}
                    </span>
                  </td>
                  <td>{transaction.balance_after}</td>
                  <td>{transaction.reason}</td>
                  <td>
                    {transaction.ref_type ? (
                      <>
                        {transaction.ref_type}:{transaction.ref_id}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{new Date(transaction.created_at).toLocaleString('es-ES')}</td>
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
    </div>
  );
};
