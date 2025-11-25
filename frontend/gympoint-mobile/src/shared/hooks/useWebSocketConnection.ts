// src/shared/hooks/useWebSocketConnection.ts
import { useEffect } from 'react';
import { useWebSocketContext } from '@shared/providers/WebSocketProvider';
import { tokenStorage } from '@shared/services/api';

/**
 * Hook para gestionar la conexión WebSocket basado en autenticación
 * Úsalo en tu AuthContext o en el componente raíz autenticado
 */
export function useWebSocketConnection(isAuthenticated: boolean) {
  const { connected, connecting } = useWebSocketContext();

  useEffect(() => {
    async function handleAuthChange() {
      const token = await tokenStorage.getAccess();

      // Si está autenticado y tiene token pero no conectado, intentar conectar
      if (isAuthenticated && token && !connected && !connecting) {
        console.log('[useWebSocketConnection] User authenticated, WebSocket will connect automatically');
      }

      // Si no está autenticado, el provider ya manejará la desconexión
      if (!isAuthenticated && connected) {
        console.log('[useWebSocketConnection] User logged out, WebSocket will disconnect');
      }
    }

    handleAuthChange();
  }, [isAuthenticated, connected, connecting]);

  return { connected, connecting };
}
