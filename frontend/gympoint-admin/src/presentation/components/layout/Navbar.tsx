import React from 'react';
import { useAdminProfile } from '../../hooks';
import { Button, ThemeToggle } from '../ui';

interface NavbarProps {
  onMenuClick: () => void;
  toggleButtonRef: React.RefObject<HTMLButtonElement>;
}

export const Navbar = ({ onMenuClick, toggleButtonRef }: NavbarProps) => {
  const { data: adminProfile } = useAdminProfile();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-0 z-50 h-16 border-b border-border bg-card shadow-sm transition-all duration-300 dark:border-border-dark dark:bg-card-dark">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">
        {/* Botón AdminPanel - Abre/cierra el sidebar */}
        <button
          ref={toggleButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            onMenuClick();
          }}
          className="group flex items-center gap-2 rounded-lg px-3 py-2 text-text transition-all hover:bg-bg dark:text-text-dark dark:hover:bg-bg-dark"
          aria-label="Abrir/cerrar menú"
        >
          <svg
            className="h-5 w-5 transition-transform group-hover:scale-110 sm:h-6 sm:w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span className="text-base font-bold text-primary transition-colors group-hover:text-primary/80 sm:text-lg">
            Panel de Administracion
          </span>
        </button>

        {/* Espaciador */}
        <div className="flex-1"></div>

        {/* Acciones de usuario */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {adminProfile && (
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-text dark:text-text-dark">
                {adminProfile.name} {adminProfile.lastname}
              </p>
              <p className="text-xs text-text-muted">
                {adminProfile.department || 'Administrador'}
              </p>
            </div>
          )}

          <ThemeToggle />

          <Button variant="danger" size="sm" onClick={handleLogout} className="shrink-0">
            <span className="hidden sm:inline">Cerrar Sesión</span>
            <span className="sm:hidden">Salir</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

