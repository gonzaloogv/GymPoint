import { Link, useLocation } from 'react-router-dom';
import { useAdminProfile } from '../../hooks';
import { Button, ThemeToggle } from '../ui';

export const Navbar = () => {
  const { data: adminProfile } = useAdminProfile();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  const navLinks = [
    { path: '/', label: 'Panel' },
    { path: '/users', label: 'Usuarios' },
    { path: '/gyms', label: 'Gimnasios' },
    { path: '/routines', label: 'Rutinas' },
    { path: '/exercises', label: 'Ejercicios' },
    { path: '/reviews', label: 'Reviews' },
    { path: '/transactions', label: 'Transacciones' },
    { path: '/rewards', label: 'Recompensas' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-card dark:bg-card-dark border-b-2 border-border dark:border-border-dark shadow-card sticky top-0 z-50">
      <div className="max-w-container mx-auto px-6 py-4">
        <div className="flex justify-between items-center gap-8">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex-shrink-0"
          >
            <h1 className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
              Admin
            </h1>
          </Link>

          {/* Links centrales */}
          <div className="flex-1 flex justify-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary/15 text-primary'
                    : 'text-text dark:text-text-dark hover:bg-bg dark:hover:bg-bg-dark hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Perfil + Theme + Logout */}
          <div className="flex-shrink-0 flex items-center gap-4">
            {adminProfile && (
              <div className="text-right">
                <p className="text-sm font-semibold text-text dark:text-text-dark">
                  {adminProfile.name} {adminProfile.lastname}
                </p>
                <p className="text-xs text-text-muted">
                  {adminProfile.department || 'Administrador'}
                </p>
              </div>
            )}
            <ThemeToggle />
            <Button 
              variant="danger" 
              size="sm"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};