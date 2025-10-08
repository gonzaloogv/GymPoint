import { useStats, useActivity, useGyms } from '../hooks';
import { Card, Loading } from '../components';

export const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: activity, isLoading: activityLoading } = useActivity(7);
  const { data: gyms, isLoading: gymsLoading } = useGyms();

  if (statsLoading || activityLoading || gymsLoading) {
    return <Loading />;
  }

  // Calcular usuarios FREE y PREMIUM
  const freeUsers = stats?.users.by_subscription.find((s) => s.subscription === 'FREE')?.count || '0';
  const premiumUsers = stats?.users.by_subscription.find((s) => s.subscription === 'PREMIUM')?.count || '0';

  return (
    <div className="dashboard">
      <h2>Panel de Control</h2>

      <div className="stats-grid">
        <Card title="Total de Usuarios">
          <div className="stat-value">{stats?.users.total}</div>
        </Card>

        <Card title="Total de Gimnasios">
          <div className="stat-value">{gyms?.length || 0}</div>
        </Card>

        <Card title="Nuevos Registros (30 días)">
          <div className="stat-value">{stats?.users.recent_registrations}</div>
        </Card>

        <Card title="Tokens en Circulación">
          <div className="stat-value">{stats?.tokens.total_in_circulation}</div>
        </Card>
      </div>

      <div className="dashboard-content">
        <Card title="Distribución de Suscripciones">
          <div className="subscription-stats">
            <div className="subscription-item">
              <span className="subscription-label">Usuarios FREE</span>
              <span className="subscription-value">{freeUsers}</span>
            </div>
            <div className="subscription-item">
              <span className="subscription-label">Usuarios PREMIUM</span>
              <span className="subscription-value premium">{premiumUsers}</span>
            </div>
          </div>
        </Card>

        <Card title="Distribución de Roles">
          <ul className="roles-list">
            {stats?.roles.map((role) => (
              <li key={role.role_name}>
                <span className="role-name">{role.role_name}</span>
                <span className="role-count">{role.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Actividad Reciente">
          <div className="activity-section">
            <h4>Nuevos Usuarios (Últimos 7 días)</h4>
            <ul className="activity-list">
              {activity?.new_users.slice(0, 5).map((user) => (
                <li key={user.id_user_profile}>
                  {user.name} ({user.email}) - {new Date(user.created_at).toLocaleDateString('es-ES')}
                </li>
              ))}
            </ul>

            <h4>Inicios de Sesión Recientes</h4>
            <ul className="activity-list">
              {activity?.recent_logins.slice(0, 5).map((login, idx) => (
                <li key={idx}>
                  {login.name} - {new Date(login.last_login).toLocaleString('es-ES')}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};
