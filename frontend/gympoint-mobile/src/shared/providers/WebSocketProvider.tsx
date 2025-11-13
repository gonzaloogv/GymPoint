// src/shared/providers/WebSocketProvider.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { websocketService } from '@shared/services/websocket.service';
import { tokenStorage } from '@shared/services/api';
import type { WebSocketContextValue, WebSocketState } from '@shared/types/websocket.types';

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
}

export function WebSocketProvider({ children, autoConnect = true }: WebSocketProviderProps) {
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
  });

  const appState = useRef(AppState.currentState);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;
  const isInitialMount = useRef(true);

  /**
   * Conectar al WebSocket
   */
  const connect = useCallback(async () => {
    console.log('[WebSocketProvider] 🔌 Connect called');

    if (state.connected || state.connecting) {
      console.log('[WebSocketProvider] Already connected or connecting, skipping');
      return;
    }

    // Verificar si hay token antes de intentar conectar
    console.log('[WebSocketProvider] Checking for auth token...');
    const token = await tokenStorage.getAccess();
    if (!token) {
      console.log('[WebSocketProvider] ❌ No auth token found - user must login first');
      setState({ connected: false, connecting: false, error: null });
      return;
    }

    console.log('[WebSocketProvider] ✅ Token found, attempting to connect...');
    setState((prev) => ({ ...prev, connecting: true, error: null }));

    try {
      const socket = await websocketService.connect();

      socket.on('connect', () => {
        setState({ connected: true, connecting: false, error: null });
        reconnectAttemptsRef.current = 0; // Reset counter on successful connection
      });

      socket.on('disconnect', (reason: string) => {
        setState((prev) => ({ ...prev, connected: false, connecting: false }));

        // Reconectar automáticamente si la desconexión no fue intencional
        if (reason !== 'io client disconnect' && reason !== 'io server disconnect') {
          scheduleReconnect();
        }
      });

      socket.on('connect_error', (error: Error) => {
        console.error('[WebSocketProvider] Connection error:', error.message);
        setState({
          connected: false,
          connecting: false,
          error: error.message,
        });

        // Solo reconectar si no es error de autenticación
        if (!error.message.includes('authentication') && !error.message.includes('token')) {
          scheduleReconnect();
        }
      });
    } catch (error: any) {
      console.error('[WebSocketProvider] Failed to connect:', error);
      setState({
        connected: false,
        connecting: false,
        error: error.message || 'Failed to connect',
      });

      // Solo reconectar si no es error de autenticación
      if (!error.message?.includes('authentication') && !error.message?.includes('token')) {
        scheduleReconnect();
      }
    }
  }, [state.connected, state.connecting]);

  /**
   * Desconectar del WebSocket
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectAttemptsRef.current = 0;
    websocketService.disconnect();
    setState({ connected: false, connecting: false, error: null });
  }, []);

  /**
   * Programar reconexión
   */
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Incrementar contador de intentos
    reconnectAttemptsRef.current++;

    // Si excedió el máximo de intentos, no reconectar
    if (reconnectAttemptsRef.current > maxReconnectAttempts) {
      return;
    }

    const delay = Math.min(3000 * reconnectAttemptsRef.current, 10000); // Backoff exponencial, max 10s

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect]);

  /**
   * Manejar cambios en el estado de la app (background/foreground)
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      // App viene del background al foreground
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Resetear contador de intentos cuando vuelve al foreground
        reconnectAttemptsRef.current = 0;

        // Verificar si hay token antes de reconectar
        const token = await tokenStorage.getAccess();
        if (!state.connected && autoConnect && token) {
          connect();
        }
      }

      // App va al background
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // Opcionalmente desconectar para ahorrar batería
        // disconnect();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [state.connected, autoConnect, connect]);

  /**
   * Auto-conectar al montar si está habilitado
   * Usa setTimeout para evitar flash en el montaje inicial
   */
  useEffect(() => {
    if (autoConnect) {
      // Delay corto para evitar flash en la UI durante montaje inicial
      const delay = isInitialMount.current ? 100 : 0;

      const timer = setTimeout(() => {
        isInitialMount.current = false;
        connect();
      }, delay);

      return () => {
        clearTimeout(timer);
      };
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  /**
   * Verificar periódicamente si el usuario hizo login y reconectar
   * Esto maneja el caso donde el usuario hace login después del montaje inicial
   */
  useEffect(() => {
    if (!autoConnect) return;

    const checkAndReconnect = async () => {
      const token = await tokenStorage.getAccess();

      // Si hay token pero no está conectado ni conectando, reconectar
      if (token && !state.connected && !state.connecting) {
        console.log('[WebSocketProvider] 🔄 Token detected after login, reconnecting...');
        connect();
      }
    };

    // Verificar cada 2 segundos
    const interval = setInterval(checkAndReconnect, 2000);

    return () => clearInterval(interval);
  }, [autoConnect, state.connected, state.connecting, connect]);

  // ============================================================================
  // NOTIFICATION METHODS
  // ============================================================================

  const subscribeToNotifications = useCallback(() => {
    websocketService.subscribeToNotifications();
  }, []);

  const unsubscribeFromNotifications = useCallback(() => {
    websocketService.unsubscribeFromNotifications();
  }, []);

  const markNotificationAsRead = useCallback((notificationId: number) => {
    websocketService.markNotificationAsRead(notificationId);
  }, []);

  // ============================================================================
  // PRESENCE METHODS
  // ============================================================================

  const joinGym = useCallback((gymId: number) => {
    websocketService.joinGym(gymId);
  }, []);

  const leaveGym = useCallback((gymId: number) => {
    websocketService.leaveGym(gymId);
  }, []);

  const checkin = useCallback((gymId: number) => {
    websocketService.checkin(gymId);
  }, []);

  const checkout = useCallback((gymId: number) => {
    websocketService.checkout(gymId);
  }, []);

  // ============================================================================
  // STREAK METHODS
  // ============================================================================

  const subscribeToStreak = useCallback(() => {
    websocketService.subscribeToStreak();
  }, []);

  const unsubscribeFromStreak = useCallback(() => {
    websocketService.unsubscribeFromStreak();
  }, []);

  // ============================================================================
  // GENERIC METHODS
  // ============================================================================

  const emit = useCallback((event: string, data?: any) => {
    websocketService.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    websocketService.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    websocketService.off(event, callback);
  }, []);

  // Memoize el context value para evitar re-renders innecesarios
  const value: WebSocketContextValue = useMemo(
    () => ({
      socket: websocketService.getSocket(),
      connected: state.connected,
      connecting: state.connecting,
      error: state.error,

      // Notifications
      subscribeToNotifications,
      unsubscribeFromNotifications,
      markNotificationAsRead,

      // Presence
      joinGym,
      leaveGym,
      checkin,
      checkout,

      // Streak
      subscribeToStreak,
      unsubscribeFromStreak,

      // Generic
      emit,
      on,
      off,
    }),
    [
      state.connected,
      state.connecting,
      state.error,
      subscribeToNotifications,
      unsubscribeFromNotifications,
      markNotificationAsRead,
      joinGym,
      leaveGym,
      checkin,
      checkout,
      subscribeToStreak,
      unsubscribeFromStreak,
      emit,
      on,
      off,
    ],
  );

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

/**
 * Hook para usar el WebSocket context
 */
export function useWebSocketContext(): WebSocketContextValue {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }

  return context;
}
