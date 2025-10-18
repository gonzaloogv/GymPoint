// src/presentation/components/Layout.tsx
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg dark:bg-bg-dark">
      <Navbar />
      <main className="flex-1 max-w-container w-full mx-auto px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
};