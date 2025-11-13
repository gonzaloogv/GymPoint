import { useMemo } from 'react';
import { useStats, useActivity, useGyms } from '../hooks';
import { Card, Loading } from '../components';

export const Dashboard = () => {
  const { data: stats, isLoading: statsLoading, isError: statsError, error: statsErrorData } = useStats();
  const { data: activity, isLoading: activityLoading, isError: activityError, error: activityErrorData } = useActivity(7);
  const { data: gyms, isLoading: gymsLoading, isError: gymsError, error: gymsErrorData } = useGyms();

  const isLoading = statsLoading || activityLoading || gymsLoading;
  const isError = statsError || activityError || gymsError;

  const freeUsers = useMemo(() => 
    stats?.users.by_subscription.find((s) => s.subscription === 'FREE')?.count || '0'
  , [stats]);

  const premiumUsers = useMemo(() =>
    stats?.users.by_subscription.find((s) => s.subscription === 'PREMIUM')?.count || '0'
  , [stats]);

  if (isLoading) {
    return <Loading fullPage />;
  }

  if (isError) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500">❌ Error en el Panel de Control</h1>
        <p className="text-text-muted mt-2">No se pudieron cargar algunos datos. Intenta refrescar la página.</p>
        <div className="mt-4 text-left bg-card dark:bg-card-dark p-4 rounded-lg max-w-lg mx-auto">
          {statsError && <p className="text-sm text-red-400">- Error de Estadísticas: {statsErrorData?.message}</p>}
          {activityError && <p className="text-sm text-red-400">- Error de Actividad: {activityErrorData?.message}</p>}
          {gymsError && <p className="text-sm text-red-400">- Error de Gimnasios: {gymsErrorData?.message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Panel de Control</h1>
        <p className="text-sm text-text-muted mt-1">Resumen general del sistema GymPoint</p>
      </header>

      <section aria-label="Estadísticas Generales" className="mb-6">
        <h2 className="sr-only">Estadísticas del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card as="article" aria-labelledby="stat-users">
            <h3 id="stat-users" className="text-text-muted text-sm mb-2">Total de Usuarios</h3>
            <p className="text-4xl font-bold text-primary">{stats?.users.total}</p>
          </Card>

          <Card as="article" aria-labelledby="stat-gyms">
            <h3 id="stat-gyms" className="text-text-muted text-sm mb-2">Total de Gimnasios</h3>
            <p className="text-4xl font-bold text-primary">{gyms?.length || 0}</p>
          </Card>

          <Card as="article" aria-labelledby="stat-registrations">
            <h3 id="stat-registrations" className="text-text-muted text-sm mb-2">Nuevos Registros (30 días)</h3>
            <p className="text-4xl font-bold text-primary">{stats?.users.recent_registrations}</p>
          </Card>

          <Card as="article" aria-labelledby="stat-tokens">
            <h3 id="stat-tokens" className="text-text-muted text-sm mb-2">Tokens en Circulación</h3>
            <p className="text-4xl font-bold text-primary">{stats?.tokens.total_in_circulation}</p>
          </Card>
        </div>
      </section>

      <section aria-label="Distribución y Actividad" className="mt-6">
        <h2 className="sr-only">Distribución de Usuarios y Actividad Reciente</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card as="article" title="Distribución de Suscripciones">
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-bg dark:bg-bg-dark p-4 rounded-lg">
              <span className="font-semibold text-text dark:text-text-dark">Usuarios FREE</span>
              <span className="text-2xl font-bold text-text-muted">{freeUsers}</span>
            </div>
            <div className="flex justify-between items-center bg-bg dark:bg-bg-dark p-4 rounded-lg">
              <span className="font-semibold text-text dark:text-text-dark">Usuarios PREMIUM</span>
              <span className="text-2xl font-bold text-primary">{premiumUsers}</span>
            </div>
          </div>
        </Card>

        <Card as="article" title="Distribución de Roles">
          <ul className="space-y-3">
            {stats?.roles.map((role) => (
              <li key={role.role_name} className="flex justify-between items-center">
                <span className="font-semibold text-text dark:text-text-dark">{role.role_name}</span>
                <span className="bg-primary/15 text-primary font-semibold px-3 py-1 rounded-full text-sm">{role.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card as="article" title="Actividad Reciente (Últimos 7 días)" className="xl:col-span-1">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-text dark:text-text-dark mb-2">Nuevos Usuarios</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                {activity?.new_users.slice(0, 5).map((user) => (
                  <li key={user.id_user_profile} className="truncate">{user.name} ({user.email})</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text dark:text-text-dark mb-2">Inicios de Sesión</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                {activity?.recent_logins.slice(0, 5).map((login, idx) => (
                  <li key={idx} className="truncate">{login.name} - {new Date(login.last_login).toLocaleString('es-ES')}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
        </div>
      </section>
    </div>
  );
};
