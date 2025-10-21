import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminProfile } from '../../hooks';
import { Button, ThemeToggle } from '../ui';

const NAV_LINKS = [
  { path: '/', label: 'Panel' },
  { path: '/users', label: 'Usuarios' },
  { path: '/gyms', label: 'Gimnasios' },
  { path: '/routines', label: 'Rutinas' },
  { path: '/exercises', label: 'Ejercicios' },
  { path: '/reviews', label: 'Reviews' },
  { path: '/transactions', label: 'Transacciones' },
  { path: '/rewards', label: 'Recompensas' },
  { path: '/daily-challenges', label: 'Desafios Diarios' },
  { path: '/achievements', label: 'Logros' },
];

export const Navbar = () => {
  const location = useLocation();
  const { data: adminProfile } = useAdminProfile();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  const isActivePath = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        !toggleRef.current?.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isMenuOpen]);

  const navLinkClasses = (path: string) =>
    `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActivePath(path)
        ? 'bg-primary/15 text-primary'
        : 'text-text hover:bg-bg hover:text-primary dark:text-text-dark dark:hover:bg-bg-dark'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-border bg-card shadow-card dark:border-border-dark dark:bg-card-dark">
      <div className="mx-auto flex max-w-container items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary transition-colors hover:text-primary/80">
            Admin
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.path} to={link.path} className={navLinkClasses(link.path)}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-bg hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-border-dark dark:text-text-dark dark:hover:bg-bg-dark md:hidden"
            aria-controls="admin-mobile-menu"
            aria-expanded={isMenuOpen}
          >
            Menu
          </button>

          {adminProfile && (
            <div className="hidden text-right sm:block">
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

      {isMenuOpen && (
        <div
          id="admin-mobile-menu"
          ref={menuRef}
          className="border-t border-border bg-card/95 px-4 py-3 dark:border-border-dark dark:bg-card-dark/95 md:hidden"
        >
          <nav className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.path} to={link.path} className={navLinkClasses(link.path)}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </nav>
  );
};

