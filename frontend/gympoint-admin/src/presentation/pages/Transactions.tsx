import { useState } from 'react';
import { useTransactions } from '../hooks';
import { Card, Loading, Button, Input, Table } from '../components';
import { Column } from '../components/ui/Table';
import { Transaction } from '@/domain';

const columns: Column<Transaction>[] = [
  { key: 'id_ledger', label: 'ID' },
  {
    key: 'user', label: 'Usuario', render: (t: Transaction) => (
      <div>
        <p className="font-semibold">{t.user?.name || 'N/A'}</p>
        <p className="text-xs text-text-muted">{t.user?.email}</p>
      </div>
    )
  },
  {
    key: 'delta', label: 'Delta', render: (t: Transaction) => (
      <span className={`font-bold ${t.delta > 0 ? 'text-success' : 'text-danger'}`}>
        {t.delta > 0 ? '+' : ''}{t.delta}
      </span>
    )
  },
  { key: 'balance_after', label: 'Balance Final' },
  { key: 'reason', label: 'Razón' },
  {
    key: 'ref_type', label: 'Referencia', render: (t: Transaction) => (
      t.ref_type ? <code>{t.ref_type}:{t.ref_id}</code> : 'N/A'
    )
  },
  {
    key: 'created_at', label: 'Fecha', render: (t: Transaction) => (
      new Date(t.created_at).toLocaleString('es-ES')
    )
  },
];

export const Transactions = () => {
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState('');

  const { data, isLoading, isError, error } = useTransactions({
    page,
    limit: 50,
    user_id: userId ? parseInt(userId) : undefined,
  });

  if (isLoading) return <Loading fullPage />;

  if (isError) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-bold text-danger">Error al Cargar las Transacciones</h1>
        <p className="text-text-muted">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-bg dark:bg-bg-dark min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">Transacciones de Tokens</h1>
          <p className="text-text-muted">Historial de todos los movimientos de tokens</p>
        </div>
      </header>

      <Card className="mb-6">
        <Input
          type="number"
          placeholder="Filtrar por ID de Usuario..."
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </Card>

      <Card>
        <Table
          columns={columns}
          data={data?.data || []}
          rowKey="id_ledger"
          loading={isLoading}
          emptyMessage="No hay transacciones que coincidan con los filtros."
        />
        {data?.pagination && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} variant="secondary">Anterior</Button>
            <span>Página {data.pagination.page} de {data.pagination.total_pages}</span>
            <Button onClick={() => setPage((p) => p + 1)} disabled={page >= data.pagination.total_pages} variant="secondary">Siguiente</Button>
          </div>
        )}
      </Card>
    </div>
  );
};
