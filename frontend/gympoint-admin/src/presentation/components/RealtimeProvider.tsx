import { ReactNode } from 'react';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { RealtimeIndicatorTooltip } from './ui/RealtimeIndicator';
import { RealtimeToastPortal } from './ui/RealtimeToast';
import { REALTIME_ENABLED } from '../../data/api/websocket.service';

interface RealtimeProviderProps {
  children: ReactNode;
  showIndicator?: boolean;
}

/**
 * Provider que inicializa la sincronización en tiempo real via WebSocket
 * Debe ser colocado dentro del QueryClientProvider y dentro de rutas protegidas
 */
export function RealtimeProvider({ children, showIndicator = false }: RealtimeProviderProps) {
  useRealtimeSync();

  return (
    <>
      {children}
      {REALTIME_ENABLED && showIndicator && <RealtimeIndicatorTooltip />}
      {REALTIME_ENABLED && <RealtimeToastPortal />}
    </>
  );
}
