import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminProfile } from '../../hooks';
import { Button, ThemeToggle } from '../ui';

const CORE_LINK_COUNT = 4;

export const Navbar = () => {
  const { data: adminProfile } = useAdminProfile();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    { path: '/daily-challenges', label: 'Desafios Diarios' },
  ];

  const coreLinks = navLinks.slice(0, CORE_LINK_COUNT);
  const extraLinks = navLinks.slice(CORE_LINK_COUNT);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-border bg-card shadow-card dark:border-border-dark dark:bg-card-dark">
      <div className="mx-auto max-w-container px-6 py-4">
        <div className="flex items-center justify-between gap-8">
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary transition-colors hover:text-primary/80">
              Admin
            </h1>
          </Link>

          <div className="flex flex-1 justify-center gap-4 md:gap-6">
            {coreLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary/15 text-primary'
                    : 'text-text hover:bg-bg hover:text-primary dark:text-text-dark dark:hover:bg-bg-dark dark:hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {extraLinks.length > 0 && (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  className="rounded-md px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-bg hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-text-dark dark:hover:bg-bg-dark dark:hover:text-primary"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  aria-haspopup="true"
                  aria-expanded={isMenuOpen}
                >
                  Mas
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-md border border-border bg-card shadow-lg dark:border-border-dark dark:bg-card-dark">
                    <ul className="py-1">
                      {extraLinks.map((link) => (
                        <li key={link.path}>
                          <Link
                            to={link.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`block px-4 py-2 text-sm transition-colors ${
                              isActive(link.path)
                                ? 'bg-primary/15 text-primary'
                                : 'text-text hover:bg-bg hover:text-primary dark:text-text-dark dark:hover:bg-bg-dark dark:hover:text-primary'
                            }`}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
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
            <Button variant="danger" size="sm" onClick={handleLogout}>
              Cerrar Sesion
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
