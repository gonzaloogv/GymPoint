import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HiOutlineChartBarSquare,
  HiOutlineUsers,
  HiOutlineBuildingOffice2,
  HiOutlineClipboardDocumentList,
  HiOutlineBolt,
  HiOutlineStar,
  HiOutlineBanknotes,
  HiOutlineGift,
  HiOutlineFlag,
  HiOutlineTrophy,
} from 'react-icons/hi2';
import type { IconType } from 'react-icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  toggleButtonRef?: React.RefObject<HTMLButtonElement>;
}

interface NavItem {
  path: string;
  label: string;
  Icon: IconType;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Panel', Icon: HiOutlineChartBarSquare },
  { path: '/users', label: 'Usuarios', Icon: HiOutlineUsers },
  { path: '/gyms', label: 'Gimnasios', Icon: HiOutlineBuildingOffice2 },
  { path: '/routines', label: 'Rutinas', Icon: HiOutlineClipboardDocumentList },
  { path: '/exercises', label: 'Ejercicios', Icon: HiOutlineBolt },
  { path: '/reviews', label: 'Reviews', Icon: HiOutlineStar },
  { path: '/transactions', label: 'Transacciones', Icon: HiOutlineBanknotes },
  { path: '/rewards', label: 'Recompensas', Icon: HiOutlineGift },
  { path: '/daily-challenges', label: 'Desafios Diarios', Icon: HiOutlineFlag },
  { path: '/achievements', label: 'Logros', Icon: HiOutlineTrophy },
];

export const Sidebar = ({ isOpen, onClose, toggleButtonRef }: SidebarProps) => {
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isActivePath = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // Cerrar al hacer clic fuera (solo en m��vil)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // No cerrar si el click fue en el bot��n toggle o dentro del sidebar
      const isClickInToggle = toggleButtonRef?.current?.contains(target);
      const isClickInSidebar = sidebarRef.current?.contains(target);

      if (!isClickInSidebar && !isClickInToggle) {
        // Solo cerrar en m��vil
        if (window.innerWidth < 1024) {
          onClose();
        }
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Solo agregar listeners en viewport m��vil
    if (window.innerWidth < 1024) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    } else {
      // En desktop solo cerrar con ESC
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose, toggleButtonRef]);

  // Cerrar sidebar al cambiar de ruta en m��vil
  useEffect(() => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  }, [location.pathname, onClose]);

  return (
    <>
      {/* Backdrop para m��vil con animaci��n */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar con animaci��n de deslizamiento suave */}
      <aside
        ref={sidebarRef}
        className={`
          fixed left-0 top-0 z-40 h-full w-64
          border-r border-border bg-card
          transform transition-all duration-300 ease-in-out
          dark:border-border-dark dark:bg-card-dark
          ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'}
        `}
        aria-label="Sidebar"
      >
        {/* Header del sidebar */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4 dark:border-border-dark">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">AdminPanel</span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-text-muted transition-colors hover:bg-bg hover:text-text dark:hover:bg-bg-dark dark:hover:text-text-dark"
            aria-label="Cerrar menǧ"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navegaci��n */}
        <nav className="overflow-y-auto p-4" style={{ height: 'calc(100% - 4rem)' }}>
          <ul className="space-y-1">
            {NAV_ITEMS.map((item, index) => (
              <li
                key={item.path}
                className={`
                  transition-all duration-300
                  ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                `}
                style={{ transitionDelay: isOpen ? `${index * 30}ms` : '0ms' }}
              >
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                    transition-all duration-200
                    ${
                      isActivePath(item.path)
                        ? 'bg-primary/15 text-primary shadow-sm'
                        : 'text-text hover:bg-bg hover:text-primary hover:shadow-sm dark:text-text-dark dark:hover:bg-bg-dark'
                    }
                  `}
                >
                  <item.Icon
                    className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};
