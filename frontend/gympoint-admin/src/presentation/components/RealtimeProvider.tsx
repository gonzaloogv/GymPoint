import { ReactNode } from 'react';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { RealtimeIndicatorTooltip } from './ui/RealtimeIndicator';

interface RealtimeProviderProps {
  children: ReactNode;
  showIndicator?: boolean;
}

/**
 * Provider que inicializa la sincronización en tiempo real via WebSocket
 * Debe ser colocado dentro del QueryClientProvider y dentro de rutas protegidas
 */
export function RealtimeProvider({ children, showIndicator = false }: RealtimeProviderProps) {
  // Hook que maneja toda la sincronización automática
  useRealtimeSync();

  return (
    <>
      {children}
      {/* Indicador de conexión en la esquina */}
      {showIndicator && <RealtimeIndicatorTooltip />}
    </>
  );
}
