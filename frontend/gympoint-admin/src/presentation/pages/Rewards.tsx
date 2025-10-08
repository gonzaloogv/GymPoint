import { useState } from 'react';
import { useGlobalRewardStats } from '../hooks';
import { Card, Loading } from '../components';

export const Rewards = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data, isLoading } = useGlobalRewardStats(fromDate, toDate, !!fromDate && !!toDate);

  const handleSearch = () => {
    // Trigger search by updating dates
    if (fromDate && toDate) {
      // Query will be triggered automatically
    }
  };

  return (
    <div className="rewards-page">
      <h2>Estadísticas de Recompensas</h2>

      <Card>
        <div className="filters">
          <label>
            Desde:
            <input
              type="datetime-local"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="date-input"
            />
          </label>

          <label>
            Hasta:
            <input
              type="datetime-local"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="date-input"
            />
          </label>

          <button onClick={handleSearch} className="btn-primary">
            Buscar
          </button>
        </div>
      </Card>

      {isLoading && <Loading />}

      {data && (
        <>
          <div className="stats-grid">
            <Card title="Total de Gimnasios">
              <div className="stat-value">{data.summary.total_gyms}</div>
            </Card>

            <Card title="Total de Reclamos">
              <div className="stat-value">{data.summary.total_claims}</div>
            </Card>

            <Card title="Total Canjeados">
              <div className="stat-value">{data.summary.total_redeemed}</div>
            </Card>

            <Card title="Total de Tokens Gastados">
              <div className="stat-value">{data.summary.total_tokens_spent}</div>
            </Card>
          </div>

          <Card title="Estadísticas por Gimnasio">
            <div className="table-container">
              <table className="rewards-table">
                <thead>
                  <tr>
                    <th>ID Gimnasio</th>
                    <th>Nombre del Gimnasio</th>
                    <th>Reclamos</th>
                    <th>Canjeados</th>
                    <th>Pendientes</th>
                    <th>Tokens Gastados</th>
                  </tr>
                </thead>
                <tbody>
                  {data.gyms.map((gym) => (
                    <tr key={gym.id_gym}>
                      <td>{gym.id_gym}</td>
                      <td>{gym.gym_name}</td>
                      <td>{gym.claims}</td>
                      <td>{gym.redeemed}</td>
                      <td>{gym.pending}</td>
                      <td>{gym.tokens_spent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
