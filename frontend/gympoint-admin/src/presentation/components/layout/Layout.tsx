import { useState, useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  // Manejar cambios de resolución
  useEffect(() => {
    const handleResize = () => {
      // Si estamos en desktop (>= 1024px) y el sidebar está abierto, cerrarlo
      // para que cuando volvamos a móvil el estado sea consistente
      if (window.innerWidth >= 1024 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  return (
    <div className="relative min-h-screen bg-bg dark:bg-bg-dark">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        toggleButtonRef={toggleButtonRef}
      />

      {/* Contenedor principal con navbar y contenido */}
      <div
        className={`
          flex min-h-screen flex-col transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}
        `}
      >
        {/* Navbar */}
        <Navbar onMenuClick={handleSidebarToggle} toggleButtonRef={toggleButtonRef} />

        {/* Contenido principal */}
        <main className="flex-1 overflow-x-auto p-4 sm:p-6">
          <div className="mx-auto min-w-fit max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};