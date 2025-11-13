import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { websocketService } from '../../data/api/websocket.service';
import type {
  GymRequestCreatedData,
  GymRequestApprovedData,
  GymRequestRejectedData,
  UserSubscriptionChangedData,
  AdminStatsUpdatedData,
} from '../../data/dto/WebSocketEvents';

/**
 * Hook para sincronizar eventos de WebSocket con TanStack Query
 * Actualiza la caché de forma silenciosa sin causar re-renders innecesarios
 *
 * Este hook debe ser usado en el componente raíz del admin panel (App.tsx)
 * para mantener todas las queries sincronizadas automáticamente
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Solo conectar si hay token
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    // Conectar al WebSocket
    websocketService.connect().catch((error) => {
      console.error('[useRealtimeSync] Failed to connect:', error);
    });

    // ========== GYM REQUESTS ==========

    // Nueva solicitud creada
    const handleGymRequestCreated = (data: GymRequestCreatedData) => {
      console.log('🔥🔥🔥 [useRealtimeSync] GYM REQUEST CREATED EVENT RECEIVED! 🔥🔥🔥');
      console.log('[useRealtimeSync] Data:', data);
      console.log('[useRealtimeSync] Gym Request:', data.gymRequest);

      // Actualizar lista de solicitudes pendientes (key correcta)
      queryClient.setQueryData<any[]>(['gym-requests', 'pending'], (old) => {
        console.log('[useRealtimeSync] Updating pending requests. Old data:', old);
        if (!old) return [data.gymRequest];
        const newData = [data.gymRequest, ...old];
        console.log('[useRealtimeSync] New pending data:', newData);
        return newData;
      });

      // También actualizar lista completa si existe (sin filtro)
      queryClient.setQueryData<any[]>(['gym-requests', undefined], (old) => {
        if (!old) return [data.gymRequest];
        return [data.gymRequest, ...old];
      });

      // Invalidar todas las variantes de gym-requests para asegurar
      console.log('[useRealtimeSync] Invalidating gym-requests queries...');
      queryClient.invalidateQueries({ queryKey: ['gym-requests'] });
      console.log('[useRealtimeSync] ✅ Cache updated successfully!');
    };

    // Solicitud aprobada
    const handleGymRequestApproved = (data: GymRequestApprovedData) => {
      console.log('[useRealtimeSync] Gym request approved:', data);

      // Invalidar para refrescar
      queryClient.invalidateQueries({ queryKey: ['gym-requests'] });
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
    };

    // Solicitud rechazada
    const handleGymRequestRejected = (data: GymRequestRejectedData) => {
      console.log('[useRealtimeSync] Gym request rejected:', data);

      // Invalidar para refrescar
      queryClient.invalidateQueries({ queryKey: ['gym-requests'] });
    };

    // ========== USER MANAGEMENT ==========

    // Suscripción de usuario cambiada
    const handleUserSubscriptionChanged = (data: UserSubscriptionChangedData) => {
      console.log('[useRealtimeSync] User subscription changed:', data);

      // Actualizar en lista de usuarios
      queryClient.setQueryData<any>(['users'], (old) => {
        if (!old?.users) return old;
        return {
          ...old,
          users: old.users.map((user: any) =>
            user.id_user_profile === data.userId || user.id_account === data.accountId
              ? { ...user, subscription_tier: data.newSubscription, isPremium: data.isPremium }
              : user
          ),
        };
      });

      // Actualizar stats si cambió a premium
      if (data.isPremium && data.previousSubscription !== 'PREMIUM') {
        queryClient.setQueryData<any>(['adminStats'], (old) => {
          if (!old) return old;
          return {
            ...old,
            premiumUsers: (old.premiumUsers || 0) + 1,
          };
        });
      } else if (!data.isPremium && data.previousSubscription === 'PREMIUM') {
        queryClient.setQueryData<any>(['adminStats'], (old) => {
          if (!old) return old;
          return {
            ...old,
            premiumUsers: Math.max((old.premiumUsers || 1) - 1, 0),
          };
        });
      }
    };

    // ========== ADMIN STATS ==========

    // Estadísticas actualizadas
    const handleStatsUpdated = (data: AdminStatsUpdatedData) => {
      console.log('[useRealtimeSync] Stats updated:', data);

      // Actualizar stats completas
      queryClient.setQueryData(['adminStats'], data.stats);
    };

    // ========== SUSCRIBIRSE A EVENTOS ==========

    console.log('[useRealtimeSync] 🎧 Registering event listeners...');
    websocketService.onGymRequestCreated(handleGymRequestCreated);
    websocketService.onGymRequestApproved(handleGymRequestApproved);
    websocketService.onGymRequestRejected(handleGymRequestRejected);
    websocketService.onUserSubscriptionChanged(handleUserSubscriptionChanged);
    websocketService.onStatsUpdated(handleStatsUpdated);
    console.log('[useRealtimeSync] ✅ All event listeners registered successfully!');

    // Cleanup: remover listeners al desmontar
    return () => {
      websocketService.off('gym:request:created', handleGymRequestCreated);
      websocketService.off('gym:request:approved', handleGymRequestApproved);
      websocketService.off('gym:request:rejected', handleGymRequestRejected);
      websocketService.off('user:subscription:changed', handleUserSubscriptionChanged);
      websocketService.off('admin:stats:updated', handleStatsUpdated);

      // Opcional: desconectar al desmontar el componente principal
      // websocketService.disconnect();
    };
  }, [queryClient]);
}

/**
 * Hook para obtener el estado de conexión de WebSocket
 */
export function useWebSocketStatus() {
  const [isConnected, setIsConnected] = React.useState(websocketService.isConnected());

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(websocketService.isConnected());
    };

    // Verificar cada segundo
    const interval = setInterval(checkConnection, 1000);

    // Verificar inmediatamente
    checkConnection();

    return () => clearInterval(interval);
  }, []);

  return isConnected;
}

// Importar React para el segundo hook
import React from 'react';
